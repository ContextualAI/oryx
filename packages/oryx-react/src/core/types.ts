import { z } from "zod";

import {
  OryxStaticErrorSchema,
  OryxRetrievalPreviewMetadataSchema,
} from "./protocol";

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
