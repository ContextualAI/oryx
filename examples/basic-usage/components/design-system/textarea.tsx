"use client";

import { type ComponentPropsWithoutRef, useRef } from "react";

import { useAutosizeTextarea } from "@contextualai/use-autosize-textarea";
import { cn } from "@/lib/tailwind";

type AutosizeTextareaProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "rows" | "value"
> & {
  value?: string;
};

/**
 * Textarea component that automatically resizes based on its content.
 * This component wraps a native textarea element with autosize behavior.
 */
export function AutosizeTextarea({
  className,
  value,
  ...props
}: AutosizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextarea(ref, value);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      className={cn("resize-none", className)}
      {...props}
    />
  );
}
