import { cn } from "@/lib/tailwind";
import { Redo2Icon, Undo2Icon } from "lucide-react";
import Link from "next/link";

type AfterContentNavigationItemProps = Readonly<{
  mode: "prev" | "next";
  label: string;
  href: string;
}>;

function AfterContentNavigationItem({
  mode,
  label,
  href,
}: AfterContentNavigationItemProps): React.ReactNode {
  const Icon = mode === "prev" ? Undo2Icon : Redo2Icon;

  return (
    <Link
      href={href}
      className={cn(
        "min-w-0 flex-1 basis-1/2 flex flex-col gap-0.75 px-3 pt-2.75 pb-3 group/next-link rounded",
        "bg-card hover:bg-card/50 focus-visible:bg-card/50 transition-colors cursor-pointer",
        mode === "prev" ? "items-start" : "items-end",
      )}
    >
      <div
        className={cn(
          "w-full flex items-center gap-1 text-secondary",
          mode === "prev" ? "flex-row" : "flex-row-reverse",
        )}
      >
        <Icon
          size={12}
          strokeWidth={1.875}
          className={"shrink-0 text-current -mx-px"}
        />
        <p className={"text-xs text-current"}>
          {mode === "prev" ? "Backtrack" : "Read Next"}
        </p>
      </div>
      <p
        className={cn(
          "text-sm text-brand underline underline-offset-2 decoration-1 decoration-brand/20 transition-colors",
          "group-hover/next-link:decoration-brand/60 group-focus-visible/next-link:decoration-brand/60",
        )}
      >
        {label}
      </p>
    </Link>
  );
}

type AfterContentNavigationProps = Readonly<{
  prevLabel?: string;
  prevHref?: string;
  nextLabel?: string;
  nextHref?: string;
}>;

/**
 * A styled link component for navigating between documentation pages.
 * Features brand coloring with underline hover effect.
 */
export function AfterContentNavigation({
  prevLabel,
  prevHref,
  nextLabel,
  nextHref,
}: AfterContentNavigationProps) {
  const hasPrev = prevLabel && prevHref;
  const hasNext = nextLabel && nextHref;

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-3 mt-20 mb-section-gap",
      )}
    >
      {hasPrev ? (
        <AfterContentNavigationItem
          mode={"prev"}
          label={prevLabel}
          href={prevHref}
        />
      ) : null}
      {hasNext ? (
        <AfterContentNavigationItem
          mode={"next"}
          label={nextLabel}
          href={nextHref}
        />
      ) : null}
    </div>
  );
}
