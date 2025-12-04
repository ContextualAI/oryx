"use client";

import { Oryx } from "@contextualai/oryx-react";

import { Markdown } from "@/components/design-system/markdown";

/**
 * Component that renders an agent message with markdown support and status display.
 */
export function AgentMessage() {
  return (
    <Oryx.Message.Agent
      render={(content) => (
        <div className={"w-full block text-sm leading-normal text-neutral-900"}>
          <Markdown>{content}</Markdown>
        </div>
      )}
    />
  );
}
