import {
  OryxMessageAgentView,
  OryxMessagesListView,
  OryxMessageUserView,
} from "./components/messages";
import {
  OryxRetrievalDocumentNameView,
  OryxRetrievalItemView,
  OryxRetrievalNumberView,
  OryxRetrievalTypeView,
  OryxRetrievalsListView,
  OryxRetrievalsRawListView,
  OryxRetrievalsSectionContentView,
  OryxRetrievalsSectionTriggerView,
  OryxRetrievalsSectionView,
  OryxRetrievalsDocumentsCountView,
} from "./components/retrievals";
import {
  OryxRetrievalPreviewContent,
  OryxRetrievalPreviewDocumentName,
  OryxRetrievalPreviewError,
  OryxRetrievalPreviewErrorMessage,
  OryxRetrievalPreviewImage,
  OryxRetrievalPreviewLoading,
  OryxRetrievalPreviewRoot,
} from "./components/retrieval-preview";
import { OryxRoot } from "./components/root";
import {
  OryxCurrentStageView,
  OryxToolCallsListView,
  OryxToolCallNameView,
  OryxToolCallStatusView,
  OryxToolCallArgumentsView,
  OryxToolCallOutputView,
  OryxToolCallErrorView,
  OryxThinkingListView,
  OryxThinkingContentView,
  OryxThinkingSummaryView,
  OryxThinkingStatusView,
  OryxWorkflowStepsListView,
  OryxWorkflowStepNameView,
  OryxWorkflowStepTypeView,
  OryxWorkflowStepStatusView,
} from "./components/steps";

// ========== Primary Type ==========

export type OryxNamespace = {
  Root: typeof OryxRoot;
  Messages: {
    List: typeof OryxMessagesListView;
  };
  Message: {
    User: typeof OryxMessageUserView;
    Agent: typeof OryxMessageAgentView;
  };
  Retrievals: {
    RawList: typeof OryxRetrievalsRawListView;
    List: typeof OryxRetrievalsListView;
    Section: typeof OryxRetrievalsSectionView;
    SectionTrigger: typeof OryxRetrievalsSectionTriggerView;
    SectionContent: typeof OryxRetrievalsSectionContentView;
    DocumentsCount: typeof OryxRetrievalsDocumentsCountView;
  };
  Retrieval: {
    Item: typeof OryxRetrievalItemView;
    Type: typeof OryxRetrievalTypeView;
    DocumentName: typeof OryxRetrievalDocumentNameView;
    Number: typeof OryxRetrievalNumberView;
  };
  RetrievalPreview: {
    Root: typeof OryxRetrievalPreviewRoot;
    Loading: typeof OryxRetrievalPreviewLoading;
    Error: typeof OryxRetrievalPreviewError;
    ErrorMessage: typeof OryxRetrievalPreviewErrorMessage;
    Content: typeof OryxRetrievalPreviewContent;
    Image: typeof OryxRetrievalPreviewImage;
    DocumentName: typeof OryxRetrievalPreviewDocumentName;
  };
  /**
   * Current workflow stage component.
   */
  CurrentStage: typeof OryxCurrentStageView;
  /**
   * Tool calls components for rendering agent tool executions.
   */
  ToolCalls: {
    List: typeof OryxToolCallsListView;
  };
  ToolCall: {
    Name: typeof OryxToolCallNameView;
    Status: typeof OryxToolCallStatusView;
    Arguments: typeof OryxToolCallArgumentsView;
    Output: typeof OryxToolCallOutputView;
    Error: typeof OryxToolCallErrorView;
  };
  /**
   * Thinking components for rendering agent reasoning steps.
   */
  Thinking: {
    List: typeof OryxThinkingListView;
    Content: typeof OryxThinkingContentView;
    Summary: typeof OryxThinkingSummaryView;
    Status: typeof OryxThinkingStatusView;
  };
  /**
   * Workflow step components for rendering agent workflow progress.
   */
  WorkflowSteps: {
    List: typeof OryxWorkflowStepsListView;
  };
  WorkflowStep: {
    Name: typeof OryxWorkflowStepNameView;
    Type: typeof OryxWorkflowStepTypeView;
    Status: typeof OryxWorkflowStepStatusView;
  };
};

// ========== Primary Component Set ==========

/**
 * Oryx is a component set for integrating Contextual AI chat interfaces into your application.
 * It provides a set of primitives for rendering user and agent messages,
 * retrieval previews, retrieval content, and intermediate steps (tool calls, thinking, workflow).
 *
 * The component set is fully unstyled and designed to be composable with your own UI.
 */
export const Oryx: OryxNamespace = {
  Root: OryxRoot,
  Messages: {
    List: OryxMessagesListView,
  },
  Message: {
    User: OryxMessageUserView,
    Agent: OryxMessageAgentView,
  },
  Retrievals: {
    RawList: OryxRetrievalsRawListView,
    List: OryxRetrievalsListView,
    Section: OryxRetrievalsSectionView,
    SectionTrigger: OryxRetrievalsSectionTriggerView,
    SectionContent: OryxRetrievalsSectionContentView,
    DocumentsCount: OryxRetrievalsDocumentsCountView,
  },
  Retrieval: {
    Item: OryxRetrievalItemView,
    Type: OryxRetrievalTypeView,
    DocumentName: OryxRetrievalDocumentNameView,
    Number: OryxRetrievalNumberView,
  },
  RetrievalPreview: {
    Root: OryxRetrievalPreviewRoot,
    Loading: OryxRetrievalPreviewLoading,
    Error: OryxRetrievalPreviewError,
    ErrorMessage: OryxRetrievalPreviewErrorMessage,
    Content: OryxRetrievalPreviewContent,
    Image: OryxRetrievalPreviewImage,
    DocumentName: OryxRetrievalPreviewDocumentName,
  },
  // Intermediate steps components
  CurrentStage: OryxCurrentStageView,
  ToolCalls: {
    List: OryxToolCallsListView,
  },
  ToolCall: {
    Name: OryxToolCallNameView,
    Status: OryxToolCallStatusView,
    Arguments: OryxToolCallArgumentsView,
    Output: OryxToolCallOutputView,
    Error: OryxToolCallErrorView,
  },
  Thinking: {
    List: OryxThinkingListView,
    Content: OryxThinkingContentView,
    Summary: OryxThinkingSummaryView,
    Status: OryxThinkingStatusView,
  },
  WorkflowSteps: {
    List: OryxWorkflowStepsListView,
  },
  WorkflowStep: {
    Name: OryxWorkflowStepNameView,
    Type: OryxWorkflowStepTypeView,
    Status: OryxWorkflowStepStatusView,
  },
};

// ========== Export Hooks ==========

export {
  useOryx,
  useOryxMessage,
  useOryxRetrievals,
  useOryxStatus,
  useOryxCurrentStage,
  useOryxToolCalls,
  useOryxThinking,
  useOryxWorkflowSteps,
  useOryxIntermediateSteps,
} from "./hooks";

export {
  useOryxContext,
  useOryxRetrievalItemContext as useOryxRetrievalItem,
  useOryxToolCallItemContext as useOryxToolCallItem,
  useOryxThinkingStepItemContext as useOryxThinkingStepItem,
  useOryxWorkflowStepItemContext as useOryxWorkflowStepItem,
} from "./context";

// ========== Export Types ==========

export type {
  OryxRetrieval,
  OryxRetrievalKind,
  OryxUserMessage,
  OryxAgentMessage,
  OryxError,
  OryxStreamingError,
  OryxState,
  OryxAction,
  OryxSSEMessage,
  OryxFetcherHandlers,
  OryxChatRequest,
  OryxChatFetcher,
  OryxRetrievalPreviewFetcher,
  OryxRetrievalPreviewMetadata,
  // Intermediate step types
  OryxToolCall,
  OryxThinkingStep,
  OryxWorkflowStep,
} from "./core/types";

export type { OryxSteppingStage, OryxToolCallStatus } from "./core/protocol";
