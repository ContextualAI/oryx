"use client";

import React, { type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/tailwind";

/**
 * Base styles for icon buttons used across the application.
 */
export const iconButtonClassName = cn(
  "size-6 shrink-0 rounded flex items-center justify-center transition cursor-pointer",
  "bg-transparent hover:bg-neutral-200/75",
);

type IconButtonProps = ComponentPropsWithoutRef<"button">;

/**
 * Reusable icon-only button with consistent styling.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={"button"}
        className={cn(iconButtonClassName, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
