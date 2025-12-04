"use client";

import { cn } from "@/lib/tailwind";
import { Undo2Icon } from "lucide-react";
import Link from "next/link";

type DocsTitleProps = Readonly<{
  className?: string;
  title: React.ReactNode;
  backHref?: string;
}>;

export function DocsTitle({ className, title, backHref }: DocsTitleProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start gap-2.5 mb-section-gap relative",
        className,
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          className={cn(
            "h-6 shrink-0 flex items-center gap-1 group/back-link",
            "text-secondary hover:text-primary focus-visible:text-primary transition-colors",
            "lg:absolute lg:right-[calc(100%+8rem)] lg:top-0",
          )}
        >
          <Undo2Icon
            size={13}
            strokeWidth={1.875}
            className={"shrink-0 text-current"}
          />
          <p className={"text-sm text-current"}>Back</p>
        </Link>
      )}
      <h1 className={"min-w-0 flex-1 text-lg leading-6 font-semibold"}>
        {title}
        <span className={"text-secondary/20 mx-2 select-none"}>{"_"}</span>
        <Link
          href={"/"}
          className={cn(
            "cursor-pointer select-none",
            "text-secondary/50 hover:text-brand focus-visible:text-brand transition-colors",
          )}
        >
          Oryx
        </Link>
      </h1>
    </div>
  );
}
