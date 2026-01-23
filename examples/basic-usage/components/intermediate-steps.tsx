"use client";

import {
  Oryx,
  useOryxCurrentStage,
  useOryxToolCalls,
  useOryxThinking,
  useOryxStatus,
} from "@contextualai/oryx-react";
import { cn } from "@/lib/tailwind";
import {
  LoaderCircleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  WrenchIcon,
  BrainIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useState } from "react";

/**
 * Displays the current workflow stage (e.g., "Retrieving...", "Generating...")
 */
export function CurrentStageIndicator() {
  const { currentStage } = useOryxCurrentStage();
  const { isStreaming } = useOryxStatus();

  if (!isStreaming || !currentStage) {
    return null;
  }

  const stageLabels: Record<string, string> = {
    retrieval: "Retrieving documents...",
    generation: "Generating response...",
    attribution: "Adding attributions...",
    thinking: "Thinking...",
    tool_execution: "Running tools...",
    post_processing: "Post-processing...",
    finalization: "Finalizing...",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-blue-50 text-blue-700 text-xs font-medium",
        "animate-pulse",
      )}
    >
      <LoaderCircleIcon size={12} className="animate-spin" />
      <span>{stageLabels[currentStage] ?? currentStage}</span>
    </div>
  );
}

/**
 * Displays active and completed tool calls.
 */
export function ToolCallsSection() {
  const { toolCalls, hasToolCalls } = useOryxToolCalls();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!hasToolCalls) {
    return null;
  }

  return (
    <div className="w-full mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-neutral-500",
          "hover:text-neutral-700 transition-colors",
        )}
      >
        <WrenchIcon size={12} />
        <span>Tool Calls ({toolCalls.length})</span>
        <ChevronDownIcon
          size={12}
          className={cn(
            "transition-transform",
            isExpanded ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          <Oryx.ToolCalls.List>
            <ToolCallItem />
          </Oryx.ToolCalls.List>
        </div>
      )}
    </div>
  );
}

/**
 * Individual tool call item display.
 */
function ToolCallItem() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        "w-full rounded-lg border bg-neutral-50 overflow-hidden",
        "text-xs",
      )}
    >
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2",
          "hover:bg-neutral-100 transition-colors",
        )}
      >
        <Oryx.ToolCall.Status
          render={(status) => {
            switch (status) {
              case "executing":
                return (
                  <LoaderCircleIcon
                    size={14}
                    className="text-blue-500 animate-spin"
                  />
                );
              case "completed":
                return (
                  <CheckCircle2Icon size={14} className="text-green-500" />
                );
              case "failed":
                return <XCircleIcon size={14} className="text-red-500" />;
            }
          }}
        />
        <Oryx.ToolCall.Name
          render={(name) => (
            <span className="font-mono font-medium text-neutral-700">
              {name}
            </span>
          )}
        />
        <Oryx.ToolCall.Status
          render={(status) => (
            <span
              className={cn(
                "ml-auto px-2 py-0.5 rounded text-[10px] font-medium",
                status === "executing" && "bg-blue-100 text-blue-700",
                status === "completed" && "bg-green-100 text-green-700",
                status === "failed" && "bg-red-100 text-red-700",
              )}
            >
              {status}
            </span>
          )}
        />
        <ChevronDownIcon
          size={12}
          className={cn(
            "text-neutral-400 transition-transform",
            showDetails ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {showDetails && (
        <div className="px-3 pb-3 space-y-2 border-t bg-white">
          <Oryx.ToolCall.Arguments
            render={(args) => (
              <div className="mt-2">
                <div className="text-[10px] font-medium text-neutral-500 mb-1">
                  Arguments
                </div>
                <pre className="p-2 rounded bg-neutral-100 text-[10px] font-mono overflow-x-auto">
                  {JSON.stringify(args, null, 2)}
                </pre>
              </div>
            )}
          />
          <Oryx.ToolCall.Output
            render={(output) => (
              <div>
                <div className="text-[10px] font-medium text-neutral-500 mb-1">
                  Output
                </div>
                <pre className="p-2 rounded bg-green-50 text-[10px] font-mono overflow-x-auto max-h-32">
                  {typeof output === "string"
                    ? output
                    : JSON.stringify(output, null, 2)}
                </pre>
              </div>
            )}
          />
          <Oryx.ToolCall.Error
            render={(error) => (
              <div>
                <div className="text-[10px] font-medium text-red-500 mb-1">
                  Error
                </div>
                <pre className="p-2 rounded bg-red-50 text-[10px] font-mono text-red-700">
                  {error}
                </pre>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Displays thinking/reasoning steps.
 */
export function ThinkingSection() {
  const { thinkingSteps, hasThinking, currentThinking } = useOryxThinking();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!hasThinking) {
    return null;
  }

  return (
    <div className="w-full mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-neutral-500",
          "hover:text-neutral-700 transition-colors",
        )}
      >
        <BrainIcon size={12} />
        <span>
          Thinking
          {currentThinking && !currentThinking.isCompleted && (
            <span className="ml-1 text-blue-500 animate-pulse">...</span>
          )}
        </span>
        <ChevronDownIcon
          size={12}
          className={cn(
            "transition-transform",
            isExpanded ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          <Oryx.Thinking.List>
            <ThinkingStepItem />
          </Oryx.Thinking.List>
        </div>
      )}
    </div>
  );
}

/**
 * Individual thinking step item display.
 */
function ThinkingStepItem() {
  return (
    <div
      className={cn(
        "w-full rounded-lg border bg-purple-50 p-3",
        "text-xs text-purple-900",
      )}
    >
      <div className="flex items-start gap-2">
        <BrainIcon size={14} className="text-purple-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <Oryx.Thinking.Summary
            render={(summary) => (
              <div className="font-medium text-purple-700 mb-1">{summary}</div>
            )}
          />
          <Oryx.Thinking.Content
            render={(content) => (
              <div className="text-purple-800 whitespace-pre-wrap wrap-break">
                {content}
              </div>
            )}
          />
          <Oryx.Thinking.Status
            render={(isCompleted) =>
              !isCompleted && (
                <span className="inline-block mt-1 text-purple-500 animate-pulse">
                  Thinking...
                </span>
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Combined component that shows all intermediate steps.
 * Place this before <AgentMessage /> in your message list.
 */
export function IntermediateSteps() {
  return (
    <div className="w-full">
      <CurrentStageIndicator />
      <div className="mt-2">
        <ToolCallsSection />
        <ThinkingSection />
      </div>
    </div>
  );
}
