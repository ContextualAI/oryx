"use client";

import { useCallback, useMemo, useReducer, useRef } from "react";
import { OryxContextPayload, useOryxMessageContext } from "./context";
import { INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER } from "./core/constants";
import { oryxReducer } from "./core/reducer";
import { OryxAction, OryxChatFetcher } from "./core/types";
import {
  mapErrorEventToAction,
  mapEventToAction,
  parseStreamEvent,
} from "./core/streaming";
import { OryxStreamEventType } from "./core/protocol";

// ========== External Hooks ==========

type UseOryxProps<TExtras> = {
  extras?: TExtras;
  fetcher: OryxChatFetcher<TExtras>;
};

type UseOryxHook = OryxContextPayload & {
  probe: OryxContextPayload;
};

export function useOryx<TExtras>({
  extras,
  fetcher,
}: UseOryxProps<TExtras>): UseOryxHook {
  const [states, dispatch] = useReducer(oryxReducer, {});
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Ref to hold the latest states value.
   * This allows `start` to access current states without re-creating the callback.
   */
  const statesRef = useRef(states);
  statesRef.current = states;

  const handleInternalError = useCallback(
    (messageId: string, error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unknown streaming error.";
      dispatch({
        messageId,
        type: "REQUEST_FAILED",
        payload: { error: { message } },
      });
    },
    [],
  );

  const start = useCallback(
    (prompt: string) => {
      // Prevent starting a new request while awaiting metadata from a previous one.
      // This avoids state collision at the placeholder key.
      if (statesRef.current[INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER]) {
        console.warn(
          "[useOryx] Cannot start a new request while awaiting metadata from a previous request. Please wait for the current request to receive its message ID.",
        );
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      dispatch({
        type: "REQUEST_STARTED",
        payload: { prompt },
      });

      let messageId: string = INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER;
      let conversationId: string | undefined = undefined;

      void fetcher(
        {
          conversationId,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          extras,
        },
        {
          signal: controller.signal,
          onOpen: () => undefined,
          onClose: () => {
            abortControllerRef.current = null;
            dispatch({ messageId, type: "REQUEST_STOPPED" });
          },
          onError: (error) => {
            handleInternalError(messageId, error);
            abortControllerRef.current = null;
          },
          onMessage: (message) => {
            const parsed = parseStreamEvent(message);
            if (!parsed) {
              return;
            }
            let action: OryxAction | null;
            switch (parsed.eventType) {
              case OryxStreamEventType.ERROR: {
                action = mapErrorEventToAction({
                  payload: parsed.payload,
                  messageId,
                });
                break;
              }
              default: {
                action = mapEventToAction({
                  eventType: parsed.eventType,
                  payload: parsed.payload,
                  messageId,
                });
                break;
              }
            }
            if (action) {
              if (action.type === "METADATA_RECEIVED") {
                messageId = action.payload.messageId;
                // When `action.payload.conversationId` is empty string,
                // fallback to the previous conversation ID (which could still be undefined).
                conversationId =
                  action.payload.conversationId || conversationId;
              }
              dispatch(action);
            }
          },
        },
      ).catch((error: unknown) => {
        handleInternalError(messageId, error);
      });
    },
    [extras, fetcher, handleInternalError],
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch({ type: "STOP_ALL_REQUESTS" });
  }, []);

  const hook = useMemo<UseOryxHook>(() => {
    const probe = {
      states,
      start,
      stop,
    };
    return {
      ...probe,
      probe,
    };
  }, [start, states, stop]);

  return hook;
}

// ========== Context Hooks ==========

/**
 * Hook to access the Oryx message context with state and metadata fields combined.
 * Must be used within an OryxMessageProvider (typically inside Oryx.Message.Agent).
 */
export function useOryxMessage() {
  const { state, messageId } = useOryxMessageContext();
  return {
    state,
    messageId,
    requestId: state.requestId,
    conversationId: state.conversationId,
  };
}

/**
 * Hook to read retrieval information from Oryx context.
 */
export function useOryxRetrievals() {
  const { state } = useOryxMessageContext();
  return {
    retrievals: state.retrievals,
  };
}

/**
 * Hook to expose the streaming status.
 */
export function useOryxStatus() {
  const { state } = useOryxMessageContext();
  return {
    isStreaming: state.isStreaming,
    error: state.error,
  };
}

/**
 * Hook to access the current workflow stage.
 */
export function useOryxCurrentStage() {
  const { state } = useOryxMessageContext();
  return {
    currentStage: state.currentStage,
  };
}

/**
 * Hook to access tool calls for the current message.
 */
export function useOryxToolCalls() {
  const { state } = useOryxMessageContext();
  return {
    toolCalls: state.toolCalls,
    hasToolCalls: state.toolCalls.length > 0,
    activeToolCalls: state.toolCalls.filter(
      (tc) => tc.status === "created" || tc.status === "executing",
    ),
    completedToolCalls: state.toolCalls.filter(
      (tc) => tc.status === "completed",
    ),
    failedToolCalls: state.toolCalls.filter((tc) => tc.status === "failed"),
  };
}

/**
 * Hook to access thinking steps for the current message.
 */
export function useOryxThinking() {
  const { state } = useOryxMessageContext();
  return {
    thinkingSteps: state.thinkingSteps,
    hasThinking: state.thinkingSteps.length > 0,
    activeThinking: state.thinkingSteps.filter((ts) => !ts.isCompleted),
    completedThinking: state.thinkingSteps.filter((ts) => ts.isCompleted),
    /**
     * The most recent thinking step (useful for showing current thinking).
     */
    currentThinking:
      state.thinkingSteps[state.thinkingSteps.length - 1] ?? null,
  };
}

/**
 * Hook to access workflow steps for the current message.
 */
export function useOryxWorkflowSteps() {
  const { state } = useOryxMessageContext();
  return {
    workflowSteps: state.workflowSteps,
    hasWorkflowSteps: state.workflowSteps.length > 0,
    activeSteps: state.workflowSteps.filter((ws) => ws.status === "running"),
    completedSteps: state.workflowSteps.filter(
      (ws) => ws.status === "completed",
    ),
    failedSteps: state.workflowSteps.filter((ws) => ws.status === "failed"),
    /**
     * The most recent workflow step.
     */
    currentStep: state.workflowSteps[state.workflowSteps.length - 1] ?? null,
  };
}

/**
 * Hook to access all intermediate steps (tool calls, thinking, workflow) in chronological order.
 * Useful for building a unified "trajectory" or "activity log" view.
 */
export function useOryxIntermediateSteps() {
  const { state } = useOryxMessageContext();

  const allSteps = useMemo(() => {
    const steps: Array<
      | {
          type: "tool_call";
          data: (typeof state.toolCalls)[0];
          timestamp: number;
        }
      | {
          type: "thinking";
          data: (typeof state.thinkingSteps)[0];
          timestamp: number;
        }
      | {
          type: "workflow";
          data: (typeof state.workflowSteps)[0];
          timestamp: number;
        }
    > = [];

    for (const tc of state.toolCalls) {
      steps.push({ type: "tool_call", data: tc, timestamp: tc.createdAt });
    }
    for (const ts of state.thinkingSteps) {
      steps.push({ type: "thinking", data: ts, timestamp: ts.startedAt });
    }
    for (const ws of state.workflowSteps) {
      steps.push({ type: "workflow", data: ws, timestamp: ws.startedAt });
    }

    return steps.sort((a, b) => a.timestamp - b.timestamp);
  }, [state.toolCalls, state.thinkingSteps, state.workflowSteps]);

  return {
    steps: allSteps,
    hasSteps: allSteps.length > 0,
    currentStage: state.currentStage,
  };
}
