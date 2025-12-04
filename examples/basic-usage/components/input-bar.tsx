"use client";

import { cn } from "@/lib/tailwind";
import { ArrowUpIcon } from "lucide-react";
import { AutosizeTextarea } from "@/components/design-system/textarea";

type InputBarProps = {
  /**
   * The current input value.
   */
  value: string;
  /**
   * Callback invoked when the input value changes.
   */
  onChange: (value: string) => void;
  /**
   * Callback invoked when the form is submitted.
   */
  onSubmit: () => void;
};

/**
 * Input bar component containing the text input and submit button.
 */
export function InputBar({ value, onChange, onSubmit }: InputBarProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full flex flex-col gap-1",
        "rounded-lg border bg-white shadow-xs",
      )}
    >
      <AutosizeTextarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={"Ask me anything..."}
        className={
          "w-full max-h-[40svh] px-2 py-1.5 text-sm text-neutral-900 focus:outline-none disabled:text-neutral-500"
        }
        onKeyDown={handleKeyDown}
      />
      <div className={"w-full flex items-center justify-end px-1.5 pb-1.5"}>
        <button
          type={"submit"}
          className={cn(
            "size-5.5 rounded-full flex items-center justify-center transition",
            "bg-neutral-600 hover:bg-neutral-800 disabled:bg-neutral-400",
            "cursor-pointer disabled:cursor-not-allowed",
          )}
        >
          <ArrowUpIcon
            size={16}
            strokeWidth={2}
            className={"shrink-0 text-neutral-50"}
          />
        </button>
      </div>
    </form>
  );
}
