import { z } from "zod";

import {
  OryxMessageCompleteEventSchema,
  OryxMessageDeltaEventSchema,
  OryxMetadataEventSchema,
  OryxRequestIdEventSchema,
  OryxRetrievalEventSchema,
  OryxStreamEventType,
  OryxStreamEventTypeSchema,
  OryxStreamingErrorEventSchema,
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
    if (payload.event === "stepping" || payload.event === "attributions") {
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
