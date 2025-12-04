"use client";

import {
  Oryx,
  useOryxMessage,
  useOryxRetrievalItem,
} from "@contextualai/oryx-react";

import { useRetrievalSelection } from "./retrieval-selection-context";
import { cn } from "@/lib/tailwind";

/**
 * Button that selects a retrieval item for preview.
 */
function RetrievalItemButton() {
  const { retrieval } = useOryxRetrievalItem();
  const { messageId } = useOryxMessage();
  const selectionContext = useRetrievalSelection();

  return (
    <button
      type={"button"}
      className={cn(
        "max-w-full flex items-center gap-1 cursor-pointer",
        "text-xs truncate text-neutral-400 hover:text-neutral-500",
      )}
      onClick={() => {
        if (messageId) {
          selectionContext?.setSelection({
            contentId: retrieval.contentId,
            messageId,
          });
        }
      }}
    >
      <Oryx.Retrieval.DocumentName />
    </button>
  );
}

/**
 * Collapsible section that renders retrieved documents.
 */
export function RetrievedDocumentsSection() {
  return (
    <Oryx.Retrievals.Section>
      <Oryx.Retrievals.SectionTrigger
        className={cn(
          "text-xs text-neutral-400 transition hover:text-neutral-600 cursor-pointer",
        )}
      >
        <Oryx.Retrievals.DocumentsCount
          render={(count) => (
            <>
              Retrieved{" "}
              <span className={"opacity-80"}>
                {count} {count === 1 ? "piece" : "pieces"} of evidence
              </span>
            </>
          )}
        />
      </Oryx.Retrievals.SectionTrigger>
      <Oryx.Retrievals.SectionContent
        className={"w-full flex flex-row flex-wrap pl-3.5 py-2 gap-1.5"}
      >
        <Oryx.Retrievals.List>
          <RetrievalItemButton />
        </Oryx.Retrievals.List>
      </Oryx.Retrievals.SectionContent>
    </Oryx.Retrievals.Section>
  );
}
