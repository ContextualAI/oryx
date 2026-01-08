import { INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER } from "./constants";
import {
  OryxAction,
  OryxState,
  OryxStates,
  OryxToolCall,
  OryxThinkingStep,
  OryxWorkflowStep,
} from "./types";

/**
 * Reducer that manages the streaming lifecycle.
 */
export function oryxReducer(
  states: OryxStates,
  action: OryxAction,
): OryxStates {
  if (action.type === "REQUEST_STARTED") {
    return {
      ...states,
      [INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER]: {
        userMessage: {
          role: "user",
          content: action.payload.prompt,
        },
        agentMessage: {
          content: "",
          isCompleted: false,
        },
        retrievals: [],
        isStreaming: true,
        error: null,
        requestId: null,
        conversationId: null,
        currentStage: null,
        toolCalls: [],
        thinkingSteps: [],
        workflowSteps: [],
      },
    };
  }

  if (action.type === "METADATA_RECEIVED") {
    const prev: OryxState | undefined =
      states[INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER];
    if (!prev) {
      console.warn("No pending message state found for metadata event");
      return states;
    }
    if (!action.payload.messageId) {
      console.warn("No message ID received for metadata event");
      return states;
    }
    // Destructure to remove the placeholder key immutably.
    const { [INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER]: _, ...rest } = states;
    return {
      ...rest,
      [action.payload.messageId]: {
        ...prev,
        conversationId: action.payload.conversationId,
        requestId: action.payload.requestId,
      },
    };
  }

  if (action.type === "STOP_ALL_REQUESTS") {
    const updated: OryxStates = {};
    for (const [messageId, state] of Object.entries(states)) {
      updated[messageId] = state.isStreaming
        ? { ...state, isStreaming: false }
        : state;
    }
    return updated;
  }

  const prev: OryxState | undefined = states[action.messageId];
  if (!prev) return states;

  switch (action.type) {
    case "REQUEST_FAILED": {
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          isStreaming: false,
          error: action.payload.error,
        },
      };
    }
    case "REQUEST_STOPPED": {
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          isStreaming: false,
        },
      };
    }
    case "MESSAGE_DELTA": {
      if (!prev.agentMessage) {
        return states;
      }

      return {
        ...states,
        [action.messageId]: {
          ...prev,
          agentMessage: {
            ...prev.agentMessage,
            content: prev.agentMessage.content + action.payload.delta,
          },
        },
      };
    }
    case "MESSAGE_COMPLETE": {
      if (!prev.agentMessage) {
        return states;
      }
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          agentMessage: {
            ...prev.agentMessage,
            content: action.payload.content,
            isCompleted: true,
          },
        },
      };
    }
    case "RETRIEVALS_RECEIVED": {
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          retrievals: action.payload.retrievals,
        },
      };
    }
    case "REQUEST_ID_RECEIVED": {
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          requestId: action.payload.requestId,
        },
      };
    }

    // ---------- Intermediate Step Actions ----------

    case "STAGE_CHANGED": {
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          currentStage: action.payload.stage,
        },
      };
    }

    case "TOOL_CALL_CREATED": {
      const newToolCall: OryxToolCall = {
        id: action.payload.toolCallId,
        name: action.payload.toolName,
        arguments: action.payload.arguments,
        status: "created",
        createdAt: Date.now(),
      };
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          toolCalls: [...prev.toolCalls, newToolCall],
        },
      };
    }

    case "TOOL_EXECUTION_STARTED": {
      const updatedToolCalls = prev.toolCalls.map((tc) =>
        tc.id === action.payload.toolCallId
          ? { ...tc, status: "executing" as const }
          : tc,
      );
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          toolCalls: updatedToolCalls,
        },
      };
    }

    case "TOOL_CALL_COMPLETED": {
      const updatedToolCalls = prev.toolCalls.map((tc) =>
        tc.id === action.payload.toolCallId
          ? {
              ...tc,
              status: action.payload.error
                ? ("failed" as const)
                : ("completed" as const),
              output: action.payload.output,
              error: action.payload.error,
              completedAt: Date.now(),
            }
          : tc,
      );
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          toolCalls: updatedToolCalls,
        },
      };
    }

    case "THINKING_STARTED": {
      const newThinkingStep: OryxThinkingStep = {
        id: action.payload.thinkingId,
        content: "",
        isCompleted: false,
        startedAt: Date.now(),
      };
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          thinkingSteps: [...prev.thinkingSteps, newThinkingStep],
        },
      };
    }

    case "THINKING_DELTA": {
      const updatedThinkingSteps = prev.thinkingSteps.map((ts) =>
        ts.id === action.payload.thinkingId
          ? { ...ts, content: ts.content + action.payload.delta }
          : ts,
      );
      // If no matching thinking step exists, create one
      if (
        !prev.thinkingSteps.some((ts) => ts.id === action.payload.thinkingId)
      ) {
        const newThinkingStep: OryxThinkingStep = {
          id: action.payload.thinkingId,
          content: action.payload.delta,
          isCompleted: false,
          startedAt: Date.now(),
        };
        return {
          ...states,
          [action.messageId]: {
            ...prev,
            thinkingSteps: [...prev.thinkingSteps, newThinkingStep],
          },
        };
      }
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          thinkingSteps: updatedThinkingSteps,
        },
      };
    }

    case "THINKING_COMPLETED": {
      const updatedThinkingSteps = prev.thinkingSteps.map((ts) =>
        ts.id === action.payload.thinkingId
          ? {
              ...ts,
              isCompleted: true,
              summary: action.payload.summary,
              completedAt: Date.now(),
            }
          : ts,
      );
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          thinkingSteps: updatedThinkingSteps,
        },
      };
    }

    case "WORKFLOW_STEP_STARTED": {
      const newWorkflowStep: OryxWorkflowStep = {
        id: action.payload.stepId,
        name: action.payload.name,
        type: action.payload.type,
        status: "running",
        startedAt: Date.now(),
      };
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          workflowSteps: [...prev.workflowSteps, newWorkflowStep],
        },
      };
    }

    case "WORKFLOW_STEP_COMPLETED": {
      const updatedWorkflowSteps = prev.workflowSteps.map((ws) =>
        ws.id === action.payload.stepId
          ? {
              ...ws,
              status: action.payload.status ?? ("completed" as const),
              completedAt: Date.now(),
            }
          : ws,
      );
      return {
        ...states,
        [action.messageId]: {
          ...prev,
          workflowSteps: updatedWorkflowSteps,
        },
      };
    }

    default:
      return states;
  }
}
