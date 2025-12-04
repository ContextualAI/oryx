"use client";

import { cn } from "@/lib/tailwind";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

type CodeBlockCopyButtonProps = Readonly<{
  /**
   * The text content to copy to clipboard.
   */
  content: string;
}>;

/**
 * A client-side button component that copies text to clipboard.
 * Shows a check icon briefly after successful copy.
 */
export function CodeBlockCopyButton({ content }: CodeBlockCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <button
      className={cn(
        "shrink-0 size-4 -m-0.5 flex items-center justify-center",
        "cursor-pointer transition text-secondary hover:text-primary",
      )}
      onClick={() => {
        navigator.clipboard.writeText(content);
        setCopied(true);
      }}
    >
      {copied ? (
        <CheckIcon size={12} strokeWidth={2} className={"text-current"} />
      ) : (
        <CopyIcon size={12} strokeWidth={2} className={"text-current"} />
      )}
    </button>
  );
}
