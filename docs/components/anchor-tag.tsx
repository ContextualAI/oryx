import { cn } from "@/lib/tailwind";

type AnchorTagProps = Readonly<{
  /**
   * The anchor id used for URL hash navigation (e.g., "section-name" for #section-name).
   */
  id: string;
  /**
   * Optional className for the anchor element.
   */
  className?: string;
}>;

/**
 * An invisible anchor element for anchor routing in MDX headings.
 * Allows users to navigate directly to a section via URL hash (e.g., /page#section-name).
 * The element is visually hidden but accessible for navigation purposes.
 */
export function AnchorTag({ id, className }: AnchorTagProps) {
  return (
    <span
      id={id}
      className={cn(
        // Make the anchor invisible and non-interactive.
        "invisible pointer-events-none",
        className,
      )}
      style={{ scrollMarginTop: "var(--spacing-section-gap)" }}
      aria-hidden={"true"}
    />
  );
}
