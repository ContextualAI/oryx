"use client";

import { Oryx, useOryxContext, useOryxStatus } from "@contextualai/oryx-react";
import { SquareIcon } from "lucide-react";

import { cn } from "@/lib/tailwind";

/**
 * Renders the user's message bubble in the chat interface.
 */
export function UserMessage() {
  const { stop } = useOryxContext();
  const { isStreaming } = useOryxStatus();

  return (
    <div
      className={cn(
        "w-full flex items-end rounded-lg border bg-white shadow-xs",
      )}
    >
      <p className={"min-w-0 flex-1 text-sm text-neutral-900 px-2 py-1.5"}>
        <Oryx.Message.User />
      </p>
      {isStreaming ? (
        <div className={"shrink-0 p-1.5 flex"}>
          <button
            type={"button"}
            onClick={() => stop()}
            className={cn(
              "size-5 rounded-full flex items-center justify-center transition",
              "bg-neutral-600 hover:bg-neutral-800",
              "cursor-pointer",
            )}
          >
            <SquareIcon
              size={10}
              strokeWidth={0}
              fill={"currentColor"}
              className={"shrink-0 text-neutral-50"}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
