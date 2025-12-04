"use client";

import { useOryxMessage, useOryxStatus } from "@contextualai/oryx-react";
import { CopyIcon, EllipsisIcon } from "lucide-react";

import { IconButton } from "@/components/design-system/icon-button";
import {
  MenuRoot,
  MenuTrigger,
  MenuPopup,
  MenuItem,
} from "@/components/design-system/menu";

/**
 * Toolbar displayed below agent messages with copy and additional actions.
 */
export function AgentMessageToolbar() {
  const { requestId, state } = useOryxMessage();
  const { isStreaming, error } = useOryxStatus();

  const handleCopyRequestId = async () => {
    if (!requestId) {
      return;
    }
    try {
      await navigator.clipboard.writeText(requestId);
    } catch (error) {
      console.error("Failed to copy request ID:", error);
    }
  };

  const handleCopyContent = async () => {
    if (!state.agentMessage?.content) {
      return;
    }
    try {
      await navigator.clipboard.writeText(state.agentMessage.content);
    } catch (error) {
      console.error("Failed to copy content:", error);
    }
  };

  return (
    <div className={"w-full flex items-center gap-3 mt-2"}>
      <div className={"min-w-0 flex-1 min-h-6 flex items-center"}>
        {isStreaming ? (
          <span
            className={"inline-block w-1.5 h-3.25 bg-neutral-900 animate-blink"}
            aria-label={"Streaming"}
          />
        ) : null}
        {error ? (
          <span className={"text-xs text-red-600"}>Error: {error.message}</span>
        ) : null}
      </div>

      {!isStreaming ? (
        <div className={"shrink-0 flex items-center gap-px"}>
          <IconButton onClick={handleCopyContent}>
            <CopyIcon
              size={14}
              strokeWidth={2}
              className={"shrink-0 text-neutral-900"}
            />
          </IconButton>

          <MenuRoot>
            <MenuTrigger>
              <EllipsisIcon
                size={14}
                strokeWidth={2}
                className={"shrink-0 text-neutral-900"}
              />
            </MenuTrigger>
            <MenuPopup>
              <MenuItem onClick={handleCopyRequestId}>Copy request ID</MenuItem>
            </MenuPopup>
          </MenuRoot>
        </div>
      ) : null}
    </div>
  );
}
