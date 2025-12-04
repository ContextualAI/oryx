"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  OryxMessageProvider,
  OryxRetrievalPreviewContextPayload,
  OryxRetrievalPreviewProvider,
  useOryxContext,
  useOryxRetrievalPreviewContext,
} from "../context";
import { OryxRetrievalPreviewMetadataSchema } from "../core/protocol";
import {
  OryxError,
  OryxRetrievalPreviewFetcher,
  OryxRetrievalPreviewMetadata,
  OryxState,
} from "../core/types";
import { useOryxRetrievals } from "../hooks";
import { extractOryxError } from "../utils/error";

// ========== Root Component ==========

type OryxRetrievalPreviewRootProps<TExtras> = {
  /**
   * The content ID of the retrieval to preview.
   */
  contentId: string;
  /**
   * The message ID to look up state for retrievals.
   * Required because one Oryx.Root can contain many messages.
   */
  messageId: string;
  /**
   * Fetcher function for retrieval preview metadata.
   */
  fetcher: OryxRetrievalPreviewFetcher<TExtras>;
  /**
   * Optional extras to pass to the fetcher.
   */
  extras?: TExtras;
} & (
  | {
      children?: React.ReactNode;
      render?: never;
    }
  | {
      render: (state: OryxRetrievalPreviewContextPayload) => React.ReactNode;
      children?: never;
    }
);

/**
 * Default empty state used when messageId is not found in states.
 */
const EMPTY_STATE: OryxState = {
  userMessage: null,
  agentMessage: null,
  retrievals: [],
  isStreaming: false,
  error: null,
  requestId: null,
  conversationId: null,
};

/**
 * Root component for retrieval preview that fetches metadata and provides it to child components.
 * Must be used inside Oryx.Root to access the states map.
 * Provides OryxMessageProvider so child components like DocumentName can access retrievals.
 */
export function OryxRetrievalPreviewRoot<TExtras>({
  contentId,
  messageId,
  fetcher,
  extras,
  children,
  render,
}: OryxRetrievalPreviewRootProps<TExtras>): JSX.Element {
  const { states } = useOryxContext();
  const [data, setData] = useState<OryxRetrievalPreviewMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<OryxError | null>(null);

  /**
   * Look up the state for the given messageId.
   */
  const state = states[messageId] ?? EMPTY_STATE;

  /**
   * The primary effect for fetching the metadata.
   */
  useEffect(() => {
    if (!messageId || !contentId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    /**
     * This is to handle when the use effect is re-run, and the previous fetch is still in progress,
     * such as when the user changes the contentId.
     * We will NOT use the result from the previous fetch.
     */
    let isCancelled = false;

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcher({
          contentId,
          messageId,
          extras,
        });

        const parsedResult = OryxRetrievalPreviewMetadataSchema.parse(result);

        if (!isCancelled) {
          setData(parsedResult);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(extractOryxError(err));
          setIsLoading(false);
        }
      }
    };

    void fetchMetadata();

    return () => {
      isCancelled = true;
    };
  }, [contentId, messageId, extras, fetcher]);

  const contextValue: OryxRetrievalPreviewContextPayload = useMemo(
    () => ({
      contentId,
      messageId,
      metadata: data,
      isLoading,
      error,
    }),
    [contentId, messageId, data, isLoading, error],
  );

  if (render) {
    return <>{render(contextValue)}</>;
  }

  return (
    <OryxMessageProvider payload={{ messageId, state }}>
      <OryxRetrievalPreviewProvider payload={contextValue}>
        {children}
      </OryxRetrievalPreviewProvider>
    </OryxMessageProvider>
  );
}

// ========== Loading Component ==========

type OryxRetrievalPreviewLoadingProps =
  | {
      children: React.ReactNode;
      render?: never;
    }
  | {
      children?: never;
      render: () => React.ReactNode;
    };

/**
 * Conditional component that renders only when metadata is being fetched.
 */
export function OryxRetrievalPreviewLoading({
  children,
  render,
}: OryxRetrievalPreviewLoadingProps): JSX.Element | null {
  const { isLoading } = useOryxRetrievalPreviewContext();
  if (!isLoading) return null;
  return <>{render?.() ?? children}</>;
}

// ========== Error Component ==========

type OryxRetrievalPreviewErrorProps =
  | {
      children: React.ReactNode;
      render?: never;
    }
  | {
      children?: never;
      render: (error: unknown) => React.ReactNode;
    };

/**
 * Conditional component that renders only when an error occurred during metadata fetch.
 */
export function OryxRetrievalPreviewError({
  children,
  render,
}: OryxRetrievalPreviewErrorProps): JSX.Element | null {
  const { error } = useOryxRetrievalPreviewContext();
  if (!error) return null;
  return <>{render?.(error) ?? children}</>;
}

// ========== Error Message Component ==========

type OryxRetrievalPreviewErrorMessageProps = {
  render?: (error: OryxError) => React.ReactNode;
};

/**
 * Component that extracts and displays an error message from the preview error state.
 * Attempts to extract a useful message from common error shapes (axios, Error instances, etc.).
 */
export function OryxRetrievalPreviewErrorMessage({
  render = (error) => <>{error.detail}</>,
}: OryxRetrievalPreviewErrorMessageProps): JSX.Element | null {
  const { error } = useOryxRetrievalPreviewContext();
  if (!error) return null;
  return <>{render(error)}</>;
}

// ========== Content Component ==========

type OryxRetrievalPreviewContentProps =
  | {
      children: React.ReactNode;
      render?: never;
    }
  | {
      children?: never;
      render: (
        metadata: NonNullable<OryxRetrievalPreviewContextPayload["metadata"]>,
      ) => React.ReactNode;
    };

/**
 * Conditional wrapper that renders only when metadata is available and there is no loading or error state.
 */
export function OryxRetrievalPreviewContent({
  children,
  render = () => children,
}: OryxRetrievalPreviewContentProps): JSX.Element | null {
  const { metadata, isLoading, error } = useOryxRetrievalPreviewContext();
  if (!metadata || isLoading || error) return null;
  return <>{render(metadata)}</>;
}

// ========== Image Component ==========

type OryxRetrievalPreviewImageProps = {
  alt?: string;
  render?: (
    pageImg: string,
    metadata: NonNullable<OryxRetrievalPreviewContextPayload["metadata"]>,
  ) => React.ReactNode;
};

/**
 * Component that renders an image from the pageImg field in metadata.
 * Expects pageImg to be a base64 string without the data:image/*;base64, prefix.
 */
export function OryxRetrievalPreviewImage({
  alt,
  render,
}: OryxRetrievalPreviewImageProps): JSX.Element | null {
  const { metadata } = useOryxRetrievalPreviewContext();
  if (!metadata) return null;
  const pageImg = metadata.page_img;
  if (render) {
    return <>{render(pageImg, metadata)}</>;
  }
  return (
    <img
      src={`data:image/*;base64,${pageImg}`}
      alt={alt ?? "Retrieved document preview"}
    />
  );
}

// ========== Document Name Component ==========

type OryxRetrievalPreviewDocumentNameProps = {
  render?: (documentName: string) => React.ReactNode;
};

/**
 * Component that renders the corresponding document name from retrieval item.
 */
export function OryxRetrievalPreviewDocumentName({
  render = (documentName) => <>{documentName}</>,
}: OryxRetrievalPreviewDocumentNameProps): JSX.Element | null {
  const { retrievals } = useOryxRetrievals();
  const { contentId } = useOryxRetrievalPreviewContext();
  const retrieval = retrievals.find((r) => r.contentId === contentId);
  if (!retrieval) return null;
  return <>{render(retrieval.name)}</>;
}

// ========== Document ID Component ==========

type OryxRetrievalPreviewDocumentIdProps = {
  render?: (documentId: string) => React.ReactNode;
};

/**
 * Component that renders the document ID from metadata.
 * Note: The schema provides `document_id` (UUID), not a human-readable document name.
 */
export function OryxRetrievalPreviewDocumentId({
  render = (documentId) => <>{documentId}</>,
}: OryxRetrievalPreviewDocumentIdProps): JSX.Element | null {
  const { metadata } = useOryxRetrievalPreviewContext();
  if (!metadata) return null;
  return <>{render(metadata.document_id)}</>;
}
