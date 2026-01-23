"use client";

import React from "react";
import {
  OryxToolCallItemProvider,
  OryxThinkingStepItemProvider,
  OryxWorkflowStepItemProvider,
  useOryxMessageContext,
  useOryxToolCallItemContext,
  useOryxThinkingStepItemContext,
  useOryxWorkflowStepItemContext,
} from "../context";
import { OryxSteppingStage } from "../core/protocol";
import { OryxToolCall, OryxThinkingStep, OryxWorkflowStep } from "../core/types";

// ========== Current Stage ==========

type OryxCurrentStageViewProps = {
  render?: (stage: OryxSteppingStage) => React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Headless component for rendering the current workflow stage.
 * Shows the current stage (e.g., "retrieval", "generation", "attribution").
 */
export function OryxCurrentStageView({
  render,
  children,
}: OryxCurrentStageViewProps): JSX.Element | null {
  const { state } = useOryxMessageContext();
  
  if (!state.currentStage) {
    return null;
  }

  if (render) {
    return <>{render(state.currentStage)}</>;
  }

  return <>{children ?? state.currentStage}</>;
}

// ========== Tool Calls List ==========

type OryxToolCallsListViewProps = {
  render?: (toolCall: OryxToolCall) => React.ReactNode;
  children?: React.ReactNode;
  /**
   * Filter to show only tool calls with specific statuses.
   */
  filter?: "all" | "active" | "completed" | "failed";
};

/**
 * Headless component for rendering a list of tool calls.
 */
export function OryxToolCallsListView({
  render,
  children,
  filter = "all",
}: OryxToolCallsListViewProps): JSX.Element {
  const { state } = useOryxMessageContext();

  let toolCalls = state.toolCalls;
  
  if (filter === "active") {
    toolCalls = toolCalls.filter((tc) => tc.status === "executing");
  } else if (filter === "completed") {
    toolCalls = toolCalls.filter((tc) => tc.status === "completed");
  } else if (filter === "failed") {
    toolCalls = toolCalls.filter((tc) => tc.status === "failed");
  }

  return (
    <>
      {toolCalls.map((toolCall) => (
        <OryxToolCallItemProvider
          key={toolCall.id}
          payload={{ toolCall }}
        >
          {render?.(toolCall) ?? children}
        </OryxToolCallItemProvider>
      ))}
    </>
  );
}

// ========== Tool Call Item Components ==========

type OryxToolCallNameViewProps = {
  render?: (name: string) => React.ReactNode;
};

/**
 * Headless component for rendering the tool call name.
 */
export function OryxToolCallNameView({
  render = (name: string) => <>{name}</>,
}: OryxToolCallNameViewProps): JSX.Element {
  const { toolCall } = useOryxToolCallItemContext("OryxToolCallNameView");
  return <>{render(toolCall.name)}</>;
}

type OryxToolCallStatusViewProps = {
  render?: (status: OryxToolCall["status"]) => React.ReactNode;
};

/**
 * Headless component for rendering the tool call status.
 */
export function OryxToolCallStatusView({
  render = (status) => <>{status}</>,
}: OryxToolCallStatusViewProps): JSX.Element {
  const { toolCall } = useOryxToolCallItemContext("OryxToolCallStatusView");
  return <>{render(toolCall.status)}</>;
}

type OryxToolCallArgumentsViewProps = {
  render?: (args: Record<string, unknown> | undefined) => React.ReactNode;
};

/**
 * Headless component for rendering the tool call arguments.
 */
export function OryxToolCallArgumentsView({
  render = (args) => <>{args ? JSON.stringify(args, null, 2) : null}</>,
}: OryxToolCallArgumentsViewProps): JSX.Element | null {
  const { toolCall } = useOryxToolCallItemContext("OryxToolCallArgumentsView");
  if (!toolCall.arguments) {
    return null;
  }
  return <>{render(toolCall.arguments)}</>;
}

type OryxToolCallOutputViewProps = {
  render?: (output: unknown) => React.ReactNode;
};

/**
 * Headless component for rendering the tool call output.
 */
export function OryxToolCallOutputView({
  render = (output) => <>{output ? JSON.stringify(output, null, 2) : null}</>,
}: OryxToolCallOutputViewProps): JSX.Element | null {
  const { toolCall } = useOryxToolCallItemContext("OryxToolCallOutputView");
  if (toolCall.output === undefined) {
    return null;
  }
  return <>{render(toolCall.output)}</>;
}

type OryxToolCallErrorViewProps = {
  render?: (error: string) => React.ReactNode;
};

/**
 * Headless component for rendering the tool call error.
 */
export function OryxToolCallErrorView({
  render = (error) => <>{error}</>,
}: OryxToolCallErrorViewProps): JSX.Element | null {
  const { toolCall } = useOryxToolCallItemContext("OryxToolCallErrorView");
  if (!toolCall.error) {
    return null;
  }
  return <>{render(toolCall.error)}</>;
}

// ========== Thinking Steps List ==========

type OryxThinkingListViewProps = {
  render?: (thinkingStep: OryxThinkingStep) => React.ReactNode;
  children?: React.ReactNode;
  /**
   * Filter to show only thinking steps with specific completion status.
   */
  filter?: "all" | "active" | "completed";
};

/**
 * Headless component for rendering a list of thinking steps.
 */
export function OryxThinkingListView({
  render,
  children,
  filter = "all",
}: OryxThinkingListViewProps): JSX.Element {
  const { state } = useOryxMessageContext();

  let thinkingSteps = state.thinkingSteps;
  
  if (filter === "active") {
    thinkingSteps = thinkingSteps.filter((ts) => !ts.isCompleted);
  } else if (filter === "completed") {
    thinkingSteps = thinkingSteps.filter((ts) => ts.isCompleted);
  }

  return (
    <>
      {thinkingSteps.map((thinkingStep) => (
        <OryxThinkingStepItemProvider
          key={thinkingStep.id}
          payload={{ thinkingStep }}
        >
          {render?.(thinkingStep) ?? children}
        </OryxThinkingStepItemProvider>
      ))}
    </>
  );
}

// ========== Thinking Step Item Components ==========

type OryxThinkingContentViewProps = {
  render?: (content: string) => React.ReactNode;
};

/**
 * Headless component for rendering the thinking content.
 */
export function OryxThinkingContentView({
  render = (content) => <>{content}</>,
}: OryxThinkingContentViewProps): JSX.Element | null {
  const { thinkingStep } = useOryxThinkingStepItemContext(
    "OryxThinkingContentView",
  );
  if (!thinkingStep.content.length) {
    return null;
  }
  return <>{render(thinkingStep.content)}</>;
}

type OryxThinkingSummaryViewProps = {
  render?: (summary: string) => React.ReactNode;
};

/**
 * Headless component for rendering the thinking summary.
 */
export function OryxThinkingSummaryView({
  render = (summary) => <>{summary}</>,
}: OryxThinkingSummaryViewProps): JSX.Element | null {
  const { thinkingStep } = useOryxThinkingStepItemContext(
    "OryxThinkingSummaryView",
  );
  if (!thinkingStep.summary) {
    return null;
  }
  return <>{render(thinkingStep.summary)}</>;
}

type OryxThinkingStatusViewProps = {
  render?: (isCompleted: boolean) => React.ReactNode;
};

/**
 * Headless component for rendering the thinking completion status.
 */
export function OryxThinkingStatusView({
  render = (isCompleted) => <>{isCompleted ? "completed" : "thinking..."}</>,
}: OryxThinkingStatusViewProps): JSX.Element {
  const { thinkingStep } = useOryxThinkingStepItemContext(
    "OryxThinkingStatusView",
  );
  return <>{render(thinkingStep.isCompleted)}</>;
}

// ========== Workflow Steps List ==========

type OryxWorkflowStepsListViewProps = {
  render?: (workflowStep: OryxWorkflowStep) => React.ReactNode;
  children?: React.ReactNode;
  /**
   * Filter to show only workflow steps with specific statuses.
   */
  filter?: "all" | "running" | "completed" | "failed";
};

/**
 * Headless component for rendering a list of workflow steps.
 */
export function OryxWorkflowStepsListView({
  render,
  children,
  filter = "all",
}: OryxWorkflowStepsListViewProps): JSX.Element {
  const { state } = useOryxMessageContext();

  let workflowSteps = state.workflowSteps;
  
  if (filter === "running") {
    workflowSteps = workflowSteps.filter((ws) => ws.status === "running");
  } else if (filter === "completed") {
    workflowSteps = workflowSteps.filter((ws) => ws.status === "completed");
  } else if (filter === "failed") {
    workflowSteps = workflowSteps.filter((ws) => ws.status === "failed");
  }

  return (
    <>
      {workflowSteps.map((workflowStep) => (
        <OryxWorkflowStepItemProvider
          key={workflowStep.id}
          payload={{ workflowStep }}
        >
          {render?.(workflowStep) ?? children}
        </OryxWorkflowStepItemProvider>
      ))}
    </>
  );
}

// ========== Workflow Step Item Components ==========

type OryxWorkflowStepNameViewProps = {
  render?: (name: string | undefined) => React.ReactNode;
};

/**
 * Headless component for rendering the workflow step name.
 */
export function OryxWorkflowStepNameView({
  render = (name) => <>{name ?? "Step"}</>,
}: OryxWorkflowStepNameViewProps): JSX.Element {
  const { workflowStep } = useOryxWorkflowStepItemContext(
    "OryxWorkflowStepNameView",
  );
  return <>{render(workflowStep.name)}</>;
}

type OryxWorkflowStepTypeViewProps = {
  render?: (type: string | undefined) => React.ReactNode;
};

/**
 * Headless component for rendering the workflow step type.
 */
export function OryxWorkflowStepTypeView({
  render = (type) => <>{type}</>,
}: OryxWorkflowStepTypeViewProps): JSX.Element | null {
  const { workflowStep } = useOryxWorkflowStepItemContext(
    "OryxWorkflowStepTypeView",
  );
  if (!workflowStep.type) {
    return null;
  }
  return <>{render(workflowStep.type)}</>;
}

type OryxWorkflowStepStatusViewProps = {
  render?: (status: OryxWorkflowStep["status"]) => React.ReactNode;
};

/**
 * Headless component for rendering the workflow step status.
 */
export function OryxWorkflowStepStatusView({
  render = (status) => <>{status}</>,
}: OryxWorkflowStepStatusViewProps): JSX.Element {
  const { workflowStep } = useOryxWorkflowStepItemContext(
    "OryxWorkflowStepStatusView",
  );
  return <>{render(workflowStep.status)}</>;
}

