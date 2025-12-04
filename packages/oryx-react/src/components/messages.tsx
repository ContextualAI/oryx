"use client";

import React, { useMemo } from "react";
import {
  OryxMessageProvider,
  useOryxContext,
  useOryxMessageContext,
} from "../context";
import { OryxState } from "../core/types";

// ========== Messages List ==========

type OryxMessagesListViewProps = {
  render?: (messageId: string, state: OryxState) => React.ReactNode;
  children?: React.ReactNode;
};

export function OryxMessagesListView({
  render,
  children,
}: OryxMessagesListViewProps): JSX.Element {
  const { states } = useOryxContext();
  const messageIds = useMemo<string[]>(() => Object.keys(states), [states]);

  return (
    <>
      {messageIds.map((messageId) => {
        const state = states[messageId];
        if (!state) {
          return null;
        }
        return (
          <OryxMessageProvider key={messageId} payload={{ messageId, state }}>
            {render?.(messageId, state) ?? children}
          </OryxMessageProvider>
        );
      })}
    </>
  );
}

// ========== User Message ==========

type OryxMessageUserViewProps = {
  render?: (prompt: string) => React.ReactNode;
};

/**
 * Headless component for rendering the user prompt.
 */
export function OryxMessageUserView({
  render = (prompt: string) => <>{prompt}</>,
}: OryxMessageUserViewProps): JSX.Element | null {
  const { state } = useOryxMessageContext();
  if (!state.userMessage) {
    return null;
  }
  return <>{render(state.userMessage.content)}</>;
}

// ========== Agent Message ==========

type OryxMessageAgentViewProps = {
  render?: (content: string) => React.ReactNode;
};

/**
 * Headless component for rendering the agent response.
 */
export function OryxMessageAgentView({
  render = (content: string) => <>{content}</>,
}: OryxMessageAgentViewProps): JSX.Element | null {
  const { state } = useOryxMessageContext();
  if (!state.agentMessage || !state.agentMessage.content.length) {
    return null;
  }
  return <>{render(state.agentMessage.content)}</>;
}
