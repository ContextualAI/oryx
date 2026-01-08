"use client";

import React, { createContext, useContext } from "react";

import {
  OryxError,
  OryxRetrieval,
  OryxRetrievalPreviewMetadata,
  OryxState,
  OryxToolCall,
  OryxThinkingStep,
  OryxWorkflowStep,
} from "./core/types";

// ========== Chat Context ==========

export type OryxContextPayload = {
  /**
   * A map of message IDs to their respective Oryx states.
   */
  states: Record<string, OryxState>;
  /**
   * Start a new chat with the given prompt.
   */
  start: (prompt: string) => void;
  /**
   * Stop all ongoing streaming requests.
   */
  stop: () => void;
};

export const OryxContext = createContext<OryxContextPayload | null>(null);

// ========== Message Context ==========

export type OryxMessageContextPayload = {
  /**
   * The message ID.
   */
  messageId: string;
  /**
   * The Oryx state for the message.
   */
  state: OryxState;
};

export const OryxMessageContext =
  createContext<OryxMessageContextPayload | null>(null);

// ========== Retrieval Preview Context ==========

export type OryxRetrievalPreviewContextPayload = {
  /**
   * The content ID for the retrieval preview.
   */
  contentId: string;
  /**
   * The message ID associated with this retrieval preview.
   */
  messageId: string;
  /**
   * The fetched metadata for the retrieval preview.
   */
  metadata: OryxRetrievalPreviewMetadata | null;
  /**
   * Whether the metadata is currently being fetched.
   */
  isLoading: boolean;
  /**
   * The error that occurred during metadata fetch.
   */
  error: OryxError | null;
};

export const OryxRetrievalPreviewContext =
  createContext<OryxRetrievalPreviewContextPayload | null>(null);

// ========== Retrieval Item Context ==========

export type OryxRetrievalItemContextPayload = {
  /**
   * The retrieval item data.
   */
  retrieval: OryxRetrieval;
};

export const OryxRetrievalItemContext =
  createContext<OryxRetrievalItemContextPayload | null>(null);

// ========== Tool Call Item Context ==========

export type OryxToolCallItemContextPayload = {
  /**
   * The tool call data.
   */
  toolCall: OryxToolCall;
};

export const OryxToolCallItemContext =
  createContext<OryxToolCallItemContextPayload | null>(null);

// ========== Thinking Step Item Context ==========

export type OryxThinkingStepItemContextPayload = {
  /**
   * The thinking step data.
   */
  thinkingStep: OryxThinkingStep;
};

export const OryxThinkingStepItemContext =
  createContext<OryxThinkingStepItemContextPayload | null>(null);

// ========== Workflow Step Item Context ==========

export type OryxWorkflowStepItemContextPayload = {
  /**
   * The workflow step data.
   */
  workflowStep: OryxWorkflowStep;
};

export const OryxWorkflowStepItemContext =
  createContext<OryxWorkflowStepItemContextPayload | null>(null);

// ========== Provider ==========

type OryxProviderProps = {
  payload: OryxContextPayload;
  children: React.ReactNode;
};

/**
 * Provider component for the Oryx context.
 */
export function OryxProvider({
  payload,
  children,
}: OryxProviderProps): JSX.Element {
  return (
    <OryxContext.Provider value={payload}>{children}</OryxContext.Provider>
  );
}

type OryxMessageProviderProps = {
  payload: OryxMessageContextPayload;
  children: React.ReactNode;
};

/**
 * Provider component for the context of a single Oryx message.
 */
export function OryxMessageProvider({
  payload,
  children,
}: OryxMessageProviderProps): JSX.Element {
  return (
    <OryxMessageContext.Provider value={payload}>
      {children}
    </OryxMessageContext.Provider>
  );
}

type OryxRetrievalPreviewProviderProps = {
  payload: OryxRetrievalPreviewContextPayload;
  children: React.ReactNode;
};

/**
 * Provider component for a single retrieval preview context.
 */
export function OryxRetrievalPreviewProvider({
  payload,
  children,
}: OryxRetrievalPreviewProviderProps): JSX.Element {
  return (
    <OryxRetrievalPreviewContext.Provider value={payload}>
      {children}
    </OryxRetrievalPreviewContext.Provider>
  );
}

type OryxRetrievalItemProviderProps = {
  payload: OryxRetrievalItemContextPayload;
  children: React.ReactNode;
};

/**
 * Provider component for a single retrieval item context.
 */
export function OryxRetrievalItemProvider({
  payload,
  children,
}: OryxRetrievalItemProviderProps): JSX.Element {
  return (
    <OryxRetrievalItemContext.Provider value={payload}>
      {children}
    </OryxRetrievalItemContext.Provider>
  );
}

type OryxToolCallItemProviderProps = {
  payload: OryxToolCallItemContextPayload;
  children: React.ReactNode;
};

/**
 * Provider component for a single tool call item context.
 */
export function OryxToolCallItemProvider({
  payload,
  children,
}: OryxToolCallItemProviderProps): JSX.Element {
  return (
    <OryxToolCallItemContext.Provider value={payload}>
      {children}
    </OryxToolCallItemContext.Provider>
  );
}

type OryxThinkingStepItemProviderProps = {
  payload: OryxThinkingStepItemContextPayload;
  children: React.ReactNode;
};

/**
 * Provider component for a single thinking step item context.
 */
export function OryxThinkingStepItemProvider({
  payload,
  children,
}: OryxThinkingStepItemProviderProps): JSX.Element {
  return (
    <OryxThinkingStepItemContext.Provider value={payload}>
      {children}
    </OryxThinkingStepItemContext.Provider>
  );
}

type OryxWorkflowStepItemProviderProps = {
  payload: OryxWorkflowStepItemContextPayload;
  children: React.ReactNode;
};

/**
 * Provider component for a single workflow step item context.
 */
export function OryxWorkflowStepItemProvider({
  payload,
  children,
}: OryxWorkflowStepItemProviderProps): JSX.Element {
  return (
    <OryxWorkflowStepItemContext.Provider value={payload}>
      {children}
    </OryxWorkflowStepItemContext.Provider>
  );
}

// ========== Hooks ==========

/**
 * Hook to access the Oryx context.
 */
export function useOryxContext(): OryxContextPayload {
  const context = useContext(OryxContext);
  if (!context) {
    throw new Error("useOryxContext must be used within an OryxProvider.");
  }
  return context;
}

/**
 * Hook to access the Oryx message context.
 */
export function useOryxMessageContext(): OryxMessageContextPayload {
  const context = useContext(OryxMessageContext);
  if (!context) {
    throw new Error(
      "useOryxMessageContext must be used within an OryxMessageProvider.",
    );
  }
  return context;
}

/**
 * Hook to access the Oryx retrieval preview context.
 */
export function useOryxRetrievalPreviewContext(): OryxRetrievalPreviewContextPayload {
  const context = useContext(OryxRetrievalPreviewContext);
  if (!context) {
    throw new Error(
      "useOryxRetrievalPreviewContext must be used within Oryx.RetrievalPreview.Root.",
    );
  }
  return context;
}

/**
 * Hook to access the Oryx retrieval item context.
 * @param componentName - Optional component name for better error messages.
 */
export function useOryxRetrievalItemContext(
  componentName?: string,
): OryxRetrievalItemContextPayload {
  const context = useContext(OryxRetrievalItemContext);
  if (!context) {
    throw new Error(
      componentName
        ? `Oryx retrieval component \`${componentName}\` must be used inside \`Oryx.Retrievals.List\` or \`Oryx.Retrievals.RawList\`.`
        : "Oryx retrieval component must be used inside `Oryx.Retrievals.List` or `Oryx.Retrievals.RawList`.",
    );
  }
  return context;
}

/**
 * Hook to access the Oryx tool call item context.
 * @param componentName - Optional component name for better error messages.
 */
export function useOryxToolCallItemContext(
  componentName?: string,
): OryxToolCallItemContextPayload {
  const context = useContext(OryxToolCallItemContext);
  if (!context) {
    throw new Error(
      componentName
        ? `Oryx tool call component \`${componentName}\` must be used inside \`Oryx.ToolCalls.List\`.`
        : "Oryx tool call component must be used inside `Oryx.ToolCalls.List`.",
    );
  }
  return context;
}

/**
 * Hook to access the Oryx thinking step item context.
 * @param componentName - Optional component name for better error messages.
 */
export function useOryxThinkingStepItemContext(
  componentName?: string,
): OryxThinkingStepItemContextPayload {
  const context = useContext(OryxThinkingStepItemContext);
  if (!context) {
    throw new Error(
      componentName
        ? `Oryx thinking component \`${componentName}\` must be used inside \`Oryx.Thinking.List\`.`
        : "Oryx thinking component must be used inside `Oryx.Thinking.List`.",
    );
  }
  return context;
}

/**
 * Hook to access the Oryx workflow step item context.
 * @param componentName - Optional component name for better error messages.
 */
export function useOryxWorkflowStepItemContext(
  componentName?: string,
): OryxWorkflowStepItemContextPayload {
  const context = useContext(OryxWorkflowStepItemContext);
  if (!context) {
    throw new Error(
      componentName
        ? `Oryx workflow step component \`${componentName}\` must be used inside \`Oryx.WorkflowSteps.List\`.`
        : "Oryx workflow step component must be used inside `Oryx.WorkflowSteps.List`.",
    );
  }
  return context;
}
