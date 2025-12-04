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
};

// ========== Primary Component Set ==========

/**
 * Oryx is a component set for integrating Contextual AI chat interfaces into your application.
 * It provides a set of primitives for rendering user and agent messages,
 * retrieval previews, and retrieval content.
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
};

// ========== Export Hooks ==========

export {
  useOryx,
  useOryxMessage,
  useOryxRetrievals,
  useOryxStatus,
} from "./hooks";

export {
  useOryxContext,
  useOryxRetrievalItemContext as useOryxRetrievalItem,
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
} from "./core/types";
