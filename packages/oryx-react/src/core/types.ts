import { z } from "zod";

import {
  OryxStaticErrorSchema,
  OryxRetrievalPreviewMetadataSchema,
} from "./protocol";
import type { OryxSteppingStage, OryxToolCallStatus } from "./protocol";

// ========== Retrieval Types ==========

/**
 * Retrieval type values exposed by Oryx.
 */
export type OryxRetrievalKind = "file";

/**
 * Normalized representation of a retrieval item.
 */
export type OryxRetrieval = {
  /**
   * Mirrors the backend `content_id` so preview fetchers can request metadata.
   */
  contentId: string;
  /**
   * Preserves the backend ordering so hosts can show the original attribution sequence.
   */
  number: number;
  /**
   * The type of retrieval.
   */
  type: OryxRetrievalKind;
  /**
   * The name of the retrieval.
   */
  name: string;
  /**
   * The snippet of the retrieval.
   */
  snippet?: string;
  /**
   * The extras of the retrieval.
   */
  extras?: Record<string, unknown>;
};

// ========== Message Types ==========

/**
 * User message tracked by Oryx.
 */
export type OryxUserMessage = {
  role: "user";
  content: string;
};

/**
 * Agent message tracked by Oryx.
 */
export type OryxAgentMessage = {
  content: string;
  isCompleted: boolean;
};

// ========== Error Types ==========

/**
 * Error shape returned by RESTful requests (non-streaming).
 */
export type OryxError = z.infer<typeof OryxStaticErrorSchema> & {
  /**
   * HTTP status code.
   */
  status: number;
};

/**
 * Error state stored when the streaming pipeline fails.
 */
export type OryxStreamingError = {
  message: string;
  code?: string;
};

// ========== Intermediate Step Types ==========

/**
 * Represents a tool call during agent execution.
 */
export type OryxToolCall = {
  /**
   * Unique identifier for the tool call.
   */
  id: string;
  /**
   * The name of the tool being called.
   */
  name: string;
  /**
   * The arguments passed to the tool.
   */
  arguments?: Record<string, unknown>;
  /**
   * The output returned by the tool.
   */
  output?: unknown;
  /**
   * Current status of the tool call.
   */
  status: OryxToolCallStatus;
  /**
   * Error message if the tool call failed.
   */
  error?: string;
  /**
   * Timestamp when the tool call was created.
   */
  createdAt: number;
  /**
   * Timestamp when the tool call completed.
   */
  completedAt?: number;
};

/**
 * Represents a thinking/reasoning step during agent execution.
 */
export type OryxThinkingStep = {
  /**
   * Unique identifier for the thinking step.
   */
  id: string;
  /**
   * The accumulated thinking content.
   */
  content: string;
  /**
   * Summary of the thinking (if available).
   */
  summary?: string;
  /**
   * Whether the thinking step is complete.
   */
  isCompleted: boolean;
  /**
   * Timestamp when the thinking step started.
   */
  startedAt: number;
  /**
   * Timestamp when the thinking step completed.
   */
  completedAt?: number;
};

/**
 * Represents a workflow step during agent execution.
 */
export type OryxWorkflowStep = {
  /**
   * Unique identifier for the step.
   */
  id: string;
  /**
   * The name of the step.
   */
  name?: string;
  /**
   * The type of the step.
   */
  type?: string;
  /**
   * Status of the step.
   */
  status: "running" | "completed" | "failed" | "cancelled";
  /**
   * Timestamp when the step started.
   */
  startedAt: number;
  /**
   * Timestamp when the step completed.
   */
  completedAt?: number;
};

// ========== State & Actions ==========

/**
 * Core state managed by the Oryx reducer.
 */
export type OryxState = {
  userMessage: OryxUserMessage | null;
  agentMessage: OryxAgentMessage | null;
  retrievals: OryxRetrieval[];
  isStreaming: boolean;
  error: OryxStreamingError | null;
  requestId: string | null;
  conversationId: string | null;
  /**
   * The reformulated query being used for retrieval.
   * Shows what the system is actually searching for.
   */
  reformulatedQuery: string | null;
  /**
   * Current workflow stage (e.g., "retrieval", "generation", "attribution").
   */
  currentStage: OryxSteppingStage | null;
  /**
   * Tool calls made during this message.
   */
  toolCalls: OryxToolCall[];
  /**
   * Thinking/reasoning steps during this message.
   */
  thinkingSteps: OryxThinkingStep[];
  /**
   * Workflow steps during this message.
   */
  workflowSteps: OryxWorkflowStep[];
};

/**
 * A map of message IDs to their respective Oryx states.
 */
export type OryxStates = Record<string, OryxState>;

/**
 * Supported reducer actions.
 */
export type OryxAction =
  | { type: "REQUEST_STARTED"; payload: { prompt: string } }
  | {
      type: "METADATA_RECEIVED";
      payload: {
        conversationId: string;
        requestId: string;
        messageId: string;
      };
    }
  | { type: "STOP_ALL_REQUESTS" }
  | ({
      messageId: string;
    } & (
      | { type: "REQUEST_FAILED"; payload: { error: OryxStreamingError } }
      | { type: "REQUEST_STOPPED" }
      | { type: "MESSAGE_DELTA"; payload: { delta: string } }
      | { type: "MESSAGE_COMPLETE"; payload: { content: string } }
      | {
          type: "RETRIEVALS_RECEIVED";
          payload: { retrievals: OryxRetrieval[] };
        }
      | { type: "REQUEST_ID_RECEIVED"; payload: { requestId: string } }
      | {
          type: "QUERY_REFORMULATION_RECEIVED";
          payload: { reformulatedQuery: string };
        }
      // Intermediate step actions
      | { type: "STAGE_CHANGED"; payload: { stage: OryxSteppingStage } }
      | {
          type: "TOOL_EXECUTION_STARTED";
          payload: {
            toolCallId: string;
            toolName: string;
            arguments?: Record<string, unknown>;
          };
        }
      | {
          type: "TOOL_CALL_COMPLETED";
          payload: { toolCallId: string; output?: unknown; error?: string };
        }
      | { type: "THINKING_STARTED"; payload: { thinkingId: string } }
      | {
          type: "THINKING_DELTA";
          payload: { thinkingId: string; delta: string };
        }
      | {
          type: "THINKING_COMPLETED";
          payload: { thinkingId: string; summary?: string };
        }
      | {
          type: "WORKFLOW_STEP_STARTED";
          payload: { stepId: string; name?: string; type?: string };
        }
      | {
          type: "WORKFLOW_STEP_COMPLETED";
          payload: {
            stepId: string;
            status?: "completed" | "failed" | "cancelled";
          };
        }
    ));

// ========== Fetcher Types ==========

/**
 * SSE message format expected by the Oryx fetcher handlers.
 */
export type OryxSSEMessage = {
  data: string;
  id?: string;
  event?: string;
};

/**
 * Handlers the fetcher must call to keep Oryx state in sync.
 */
export type OryxFetcherHandlers = {
  onOpen: (response: Response) => void | Promise<void>;
  onMessage: (event: OryxSSEMessage) => void;
  onError: (error: unknown) => void;
  onClose: () => void;
  signal: AbortSignal;
};

/**
 * Chat request shape passed to the fetcher.
 */
export type OryxChatRequest<TExtras> = {
  conversationId: string | undefined;
  messages: OryxUserMessage[];
  extras?: TExtras;
};

/**
 * Fetcher contract similar to SWR/React Query fetchers.
 */
export type OryxChatFetcher<TExtras = Record<string, unknown>> = (
  request: OryxChatRequest<TExtras>,
  handlers: OryxFetcherHandlers,
) => Promise<void>;

// ========== Retrieval Preview Types ==========

/**
 * Metadata shape returned by the retrieval preview API.
 */
export type OryxRetrievalPreviewMetadata = z.infer<
  typeof OryxRetrievalPreviewMetadataSchema
>;

/**
 * Fetcher contract for retrieval preview metadata.
 * Receives Oryx identifiers and host-provided extras, returns metadata or throws on error.
 */
export type OryxRetrievalPreviewFetcher<TExtras = Record<string, unknown>> =
  (params: {
    /**
     * Content ID of the retrieval to fetch metadata for.
     */
    contentId: string;
    /**
     * Message ID associated with the retrieval.
     */
    messageId: string;
    /**
     * Host-provided extras (e.g., agentId, tenant, auth tokens).
     */
    extras?: TExtras;
  }) => Promise<unknown>;
