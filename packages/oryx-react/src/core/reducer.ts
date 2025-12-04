import { INTERNAL_PENDING_MESSAGE_ID_PLACEHOLDER } from "./constants";
import { OryxAction, OryxState, OryxStates } from "./types";

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
    default:
      return states;
  }
}
