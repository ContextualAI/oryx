import { z } from "zod";

import {
  OryxMessageCompleteEventSchema,
  OryxMessageDeltaEventSchema,
  OryxMetadataEventSchema,
  OryxQueryReformulationEventSchema,
  OryxRequestIdEventSchema,
  OryxRetrievalEventSchema,
  OryxStreamEventType,
  OryxStreamEventTypeSchema,
  OryxStreamingErrorEventSchema,
  OryxSteppingEventSchema,
  OryxToolCallStartEventSchema,
  OryxToolCallEndEventSchema,
  OryxThinkingStartEventSchema,
  OryxThinkingDeltaEventSchema,
  OryxThinkingEndEventSchema,
  OryxStepStartEventSchema,
  OryxStepEndEventSchema,
} from "./protocol";
import { mapRetrievalEventPayloadToOryxRetrievals } from "./retrievals";
import { OryxAction, OryxSSEMessage, OryxStreamingError } from "./types";

// ========== Internal Types ==========

/**
 * Schema for versioned stream payloads.
 */
const VersionedStreamPayloadSchema = z.object({
  version: z.string(),
  event: z
    .object({
      /**
       * The type of the event.
       */
      type: z.string(),
    })
    .catchall(z.unknown()),
});

/**
 * Schema for legacy stream payloads.
 */
const LegacyStreamPayloadSchema = z
  .object({
    event: z.unknown().optional(),
    data: z.record(z.unknown()).optional(),
  })
  .catchall(z.unknown());

type LegacyStreamPayload = z.infer<typeof LegacyStreamPayloadSchema>;
type VersionedStreamPayload = z.infer<typeof VersionedStreamPayloadSchema>;

/**
 * Determine whether the parsed payload contains the versioned envelope format.
 * We use a dedicated function to narrow the typing scope.
 */
function isVersionedStreamPayload(
  payload: unknown,
): payload is VersionedStreamPayload {
  return VersionedStreamPayloadSchema.safeParse(payload).success;
}

/**
 * Normalize both legacy and versioned stream payloads into the legacy shape.
 */
function mapStreamingDataToLegacyPayload(
  payload: unknown,
): LegacyStreamPayload | null {
  if (isVersionedStreamPayload(payload)) {
    return {
      event: payload.event.type,
      data: payload.event,
    };
  }
  const legacyPayloadResult = LegacyStreamPayloadSchema.safeParse(payload);
  if (!legacyPayloadResult.success) {
    console.error("Invalid legacy payload shape:", legacyPayloadResult.error);
    return null;
  }
  return legacyPayloadResult.data;
}

// ========== Event Parsing ==========

/**
 * Parse the SSE message payload and normalize it into an event tuple.
 */
export function parseStreamEvent(message: OryxSSEMessage): {
  eventType: OryxStreamEventType;
  payload: Record<string, unknown>;
} | null {
  if (!message.data) {
    return null;
  }
  if (message.data.startsWith(": ping")) {
    return null;
  }
  if (!message.data.startsWith("{")) {
    console.error("Received non-JSON SSE message:", message.data);
    return null;
  }

  // ---------- JSON Data Parsing ----------

  let jsonData: unknown;
  try {
    jsonData = JSON.parse(message.data);
  } catch (error) {
    console.error("Failed to parse SSE JSON message:", error);
    return null;
  }
  const payload = mapStreamingDataToLegacyPayload(jsonData);
  if (!payload) {
    return null;
  }

  // ---------- Event Type Parsing ----------

  const parsedEventType = OryxStreamEventTypeSchema.safeParse(payload.event);
  if (!parsedEventType.success) {
    // Handle known informational events that don't need state changes
    if (payload.event === "attributions") {
      // Silently ignore these informational events because they are known.
      return null;
    }
    console.warn("Unsupported stream event type:", payload.event);
    return null;
  }
  return {
    eventType: parsedEventType.data,
    payload: payload.data ?? {},
  };
}

// ========== Action Mapping ==========

type MapEventToActionParams = {
  eventType: OryxStreamEventType;
  payload: Record<string, unknown>;
  messageId: string;
};

/**
 * Map parsed stream events into reducer actions.
 */
export function mapEventToAction({
  eventType,
  payload,
  messageId,
}: MapEventToActionParams): OryxAction | null {
  switch (eventType) {
    // ---------- Retrievals ----------
    case OryxStreamEventType.RETRIEVALS: {
      const parsed = OryxRetrievalEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid retrieval payload:", parsed.error);
        return null;
      }
      const retrievals = mapRetrievalEventPayloadToOryxRetrievals(parsed.data);
      if (!retrievals.length) {
        return null;
      }
      return {
        messageId,
        type: "RETRIEVALS_RECEIVED",
        payload: { retrievals },
      };
    }

    // ---------- Message Delta ----------
    case OryxStreamEventType.MESSAGE_DELTA: {
      const parsed = OryxMessageDeltaEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid message delta payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "MESSAGE_DELTA",
        payload: { delta: parsed.data.delta },
      };
    }

    // ---------- Message Complete ----------
    case OryxStreamEventType.MESSAGE_COMPLETE: {
      const parsed = OryxMessageCompleteEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid message complete payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "MESSAGE_COMPLETE",
        payload: { content: parsed.data.final_message },
      };
    }

    // ---------- Metadata ----------
    case OryxStreamEventType.METADATA: {
      const parsed = OryxMetadataEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid metadata payload:", parsed.error);
        return null;
      }
      return {
        type: "METADATA_RECEIVED",
        payload: {
          conversationId: parsed.data.conversation_id,
          requestId: parsed.data.request_id,
          messageId: parsed.data.message_id,
        },
      };
    }

    // ---------- Request ID ----------
    case OryxStreamEventType.REQUEST_ID: {
      const parsed = OryxRequestIdEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid request_id payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "REQUEST_ID_RECEIVED",
        payload: { requestId: parsed.data.request_id },
      };
    }

    // ---------- Query Reformulation ----------
    case OryxStreamEventType.QUERY_REFORMULATION: {
      const parsed = OryxQueryReformulationEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid query_reformulation payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "QUERY_REFORMULATION_RECEIVED",
        payload: { reformulatedQuery: parsed.data.reformulated_query },
      };
    }

    // ---------- Stepping (Stage Progress) ----------
    case OryxStreamEventType.STEPPING: {
      const parsed = OryxSteppingEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid stepping payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "STAGE_CHANGED",
        payload: { stage: parsed.data.type },
      };
    }

    // ---------- Tool Call Start ----------
    case OryxStreamEventType.TOOL_CALL_START: {
      const parsed = OryxToolCallStartEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid tool_call_start payload:", parsed.error);
        return null;
      }
      let args: Record<string, unknown> | undefined;
      try {
        args = JSON.parse(parsed.data.tool_args);
      } catch {
        args = { raw: parsed.data.tool_args };
      }
      return {
        messageId,
        type: "TOOL_EXECUTION_STARTED",
        payload: {
          toolCallId: parsed.data.tool_id,
          toolName: parsed.data.tool_name,
          arguments: args,
        },
      };
    }

    // ---------- Tool Call End ----------
    case OryxStreamEventType.TOOL_CALL_END: {
      const parsed = OryxToolCallEndEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid tool_call_end payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "TOOL_CALL_COMPLETED",
        payload: {
          toolCallId: parsed.data.tool_id,
          output: parsed.data.tool_output,
          error: parsed.data.successful ? undefined : parsed.data.error,
        },
      };
    }

    // ---------- Thinking Start ----------
    case OryxStreamEventType.THINKING_START: {
      const parsed = OryxThinkingStartEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid thinking_start payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "THINKING_STARTED",
        payload: { thinkingId: parsed.data.think_id },
      };
    }

    // ---------- Thinking Delta ----------
    case OryxStreamEventType.THINKING_DELTA: {
      const parsed = OryxThinkingDeltaEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid thinking_delta payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "THINKING_DELTA",
        payload: {
          thinkingId: parsed.data.think_id ?? "default",
          delta: parsed.data.delta,
        },
      };
    }

    // ---------- Thinking End ----------
    case OryxStreamEventType.THINKING_END: {
      const parsed = OryxThinkingEndEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid thinking_end payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "THINKING_COMPLETED",
        payload: {
          thinkingId: parsed.data.think_id,
          summary: parsed.data.thinking_summary,
        },
      };
    }

    // ---------- Step Start ----------
    case OryxStreamEventType.STEP_START: {
      const parsed = OryxStepStartEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid step_start payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "WORKFLOW_STEP_STARTED",
        payload: {
          stepId: parsed.data.step_id,
          name: parsed.data.step_name,
          type: parsed.data.step_type,
        },
      };
    }

    // ---------- Step End ----------
    case OryxStreamEventType.STEP_END: {
      const parsed = OryxStepEndEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.error("Invalid step_end payload:", parsed.error);
        return null;
      }
      return {
        messageId,
        type: "WORKFLOW_STEP_COMPLETED",
        payload: {
          stepId: parsed.data.step_id,
          status: parsed.data.status,
        },
      };
    }

    // ---------- End ----------
    case OryxStreamEventType.END: {
      return { messageId, type: "REQUEST_STOPPED" };
    }

    // ---------- Unhandled Events ----------
    default:
      console.error("Unhandled stream event type:", eventType);
      return null;
  }
}

// ========== Error Event Mapping ==========

type MapErrorEventToActionParams = {
  payload: Record<string, unknown>;
  messageId: string;
};

/**
 * Map an error event payload into an Oryx action.
 */
export function mapErrorEventToAction({
  payload,
  messageId,
}: MapErrorEventToActionParams): OryxAction | null {
  const parsedError = OryxStreamingErrorEventSchema.safeParse(payload);
  if (!parsedError.success) {
    console.error("Invalid error payload:", parsedError.error);
    return null;
  }
  const oryxError: OryxStreamingError = {
    message: parsedError.data.message,
    code: parsedError.data.error_code,
  };
  return {
    messageId,
    type: "REQUEST_FAILED",
    payload: {
      error: oryxError,
    },
  };
}
