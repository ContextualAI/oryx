"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Oryx, useOryx, type OryxChatFetcher } from "@contextualai/oryx-react";

import { AgentMessage } from "@/components/agent-message";
import { IconButton } from "@/components/design-system/icon-button";
import { InputBar } from "@/components/input-bar";
import { UserMessage } from "@/components/user-message";
import { RetrievalPreview } from "@/components/retrieval-preview";
import {
  RetrievalSelectionProvider,
  type RetrievalSelection,
} from "@/components/retrieval-selection-context";
import { RetrievedDocumentsSection } from "@/components/retrieval-section";
import { IntermediateSteps } from "@/components/intermediate-steps";
import { SquarePenIcon } from "lucide-react";
import { cn } from "@/lib/tailwind";
import { AgentMessageToolbar } from "@/components/agent-message-toolbar";

/**
 * Shared Oryx fetcher that streams through the local proxy endpoint.
 */
const oryxChatFetcher: OryxChatFetcher = async (request, handlers) => {
  try {
    await fetchEventSource(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: request.messages,
        conversation_id: request.conversationId,
        stream: true,
      }),
      signal: handlers.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (!response.ok) {
          throw new Error(`Proxy responded with ${response.status}.`);
        }
        await handlers.onOpen(response);
      },
      onmessage(event) {
        handlers.onMessage(event);
      },
      onerror(error) {
        handlers.onError(error);
      },
      onclose() {
        handlers.onClose();
      },
    });
  } catch (error) {
    handlers.onError(error);
    throw error;
  }
};

type OryxChatProps = {
  /**
   * Optional initial prompt to start the chat with.
   */
  prompt?: string;
};

/**
 * Client component that renders the Oryx chat interface using Tailwind styles.
 */
export function OryxChat({ prompt: initialPrompt }: OryxChatProps) {
  const { probe, start } = useOryx({ fetcher: oryxChatFetcher });
  const [inputValue, setInputValue] = useState("");
  const hasStartedInitialPrompt = useRef(false);

  /**
   * Controls visibility of the preview panel separately from selection content.
   * This allows the panel to animate out while still rendering the selection content.
   */
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /**
   * Currently selected retrieval for preview.
   */
  const [selection, setSelection] = useState<RetrievalSelection | null>(null);

  /**
   * Wrapper for setSelection that also opens the preview panel.
   */
  const handleSetSelection = (nextSelection: RetrievalSelection) => {
    setSelection(nextSelection);
    setIsPreviewOpen(true);
  };

  /**
   * Auto-start with initial prompt if provided.
   */
  useEffect(() => {
    if (initialPrompt && !hasStartedInitialPrompt.current) {
      hasStartedInitialPrompt.current = true;
      start(initialPrompt);
    }
  }, [initialPrompt, start]);

  const submitPrompt = () => {
    const trimmed = inputValue.trim();
    if (!trimmed.length) {
      return;
    }
    start(trimmed);
    setInputValue("");
  };

  const handleClearChat = () => {
    window.location.reload();
  };

  return (
    <Oryx.Root probe={probe}>
      <RetrievalSelectionProvider
        selection={selection}
        setSelection={handleSetSelection}
      >
        <div
          className={cn(
            "w-lg h-full shrink flex flex-col items-center overflow-hidden rounded-2xl border bg-white",
            "z-10",
          )}
        >
          <div
            className={cn(
              "w-full h-11 shrink-0 flex items-center justify-between px-3.5 gap-3",
              "border-b bg-neutral-50",
            )}
          >
            <IconButton onClick={handleClearChat} className={"-mx-1"}>
              <SquarePenIcon
                size={14}
                strokeWidth={2}
                className={"shrink-0 text-neutral-900"}
              />
            </IconButton>
            <h1 className={"text-xs text-neutral-400"}>
              Powered by Contextual AI
            </h1>
          </div>
          <div
            className={
              "w-full min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2 hide-scrollbar"
            }
          >
            <Oryx.Messages.List>
              <UserMessage />
              <div
                className={
                  "w-full flex flex-col items-start px-2 pt-3 pb-7 last:min-h-120"
                }
              >
                <RetrievedDocumentsSection />
                <IntermediateSteps />
                <AgentMessage />
                <AgentMessageToolbar />
              </div>
            </Oryx.Messages.List>
          </div>

          <div className={"w-full shrink-0 flex flex-col px-2 pb-2"}>
            <InputBar
              value={inputValue}
              onChange={setInputValue}
              onSubmit={submitPrompt}
            />
          </div>
        </div>

        <div
          className={cn(
            "w-2xl h-full shrink flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200",
            "z-0 origin-left",
            isPreviewOpen
              ? "opacity-100 ml-4 scale-100 translate-x-0"
              : "opacity-0 ml-0 -mr-168 scale-95 translate-x-80 pointer-events-none select-none",
          )}
        >
          {selection ? (
            <RetrievalPreview
              contentId={selection.contentId}
              messageId={selection.messageId}
              onClose={() => setIsPreviewOpen(false)}
            />
          ) : null}
        </div>
      </RetrievalSelectionProvider>
    </Oryx.Root>
  );
}
