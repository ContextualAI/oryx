"use client";

import axios from "axios";
import { XIcon } from "lucide-react";

import {
  Oryx,
  type OryxRetrievalPreviewFetcher,
} from "@contextualai/oryx-react";

import { IconButton } from "@/components/design-system/icon-button";
import { cn } from "@/lib/tailwind";

/**
 * Fetcher function for retrieval preview metadata.
 * Returns the raw content metadata from the API response.
 */
const fetchRetrievalMetadata: OryxRetrievalPreviewFetcher = async ({
  contentId,
  messageId,
}) => {
  const params = new URLSearchParams();
  params.set("messageId", messageId);
  params.set("contentId", contentId);

  const { data } = await axios.get(`/api/retrieval-info?${params.toString()}`);
  const first = data.content_metadatas?.[0] ?? null;

  if (!first) {
    throw new Error("No metadata found for this retrieval.");
  }
  return first;
};

type RetrievalPreviewProps = {
  /**
   * Content ID of the retrieval to preview.
   */
  contentId: string;
  /**
   * Message ID associated with the retrieval.
   */
  messageId: string;
  /**
   * Callback when the close button is clicked.
   */
  onClose: () => void;
};

/**
 * Component that renders a retrieval preview using Oryx.RetrievalPreview primitives.
 * Includes a header with the document name and close button.
 */
export function RetrievalPreview({
  contentId,
  messageId,
  onClose,
}: RetrievalPreviewProps) {
  return (
    <Oryx.RetrievalPreview.Root
      contentId={contentId}
      messageId={messageId}
      fetcher={fetchRetrievalMetadata}
    >
      <div
        className={cn(
          "w-full h-11 shrink-0 flex items-center justify-between px-3.5 gap-3",
          "border-b bg-neutral-50",
        )}
      >
        <h2 className={"text-sm font-medium text-neutral-900 truncate"}>
          <Oryx.RetrievalPreview.DocumentName />
        </h2>
        <IconButton onClick={onClose} className={"-mx-1"}>
          <XIcon
            size={14}
            strokeWidth={2}
            className={"shrink-0 text-neutral-900"}
          />
        </IconButton>
      </div>

      <div className={"w-full min-h-0 flex-1 overflow-y-auto"}>
        <Oryx.RetrievalPreview.Loading>
          <div className={"flex items-center justify-center p-8"}>
            <div className={"text-sm text-neutral-600"}>Loading preview...</div>
          </div>
        </Oryx.RetrievalPreview.Loading>

        <Oryx.RetrievalPreview.Error>
          <div
            className={
              "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            }
          >
            <Oryx.RetrievalPreview.ErrorMessage />
          </div>
        </Oryx.RetrievalPreview.Error>

        <Oryx.RetrievalPreview.Content>
          <Oryx.RetrievalPreview.Image />
        </Oryx.RetrievalPreview.Content>
      </div>
    </Oryx.RetrievalPreview.Root>
  );
}
