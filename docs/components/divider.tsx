import { cn } from "@/lib/tailwind";

type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps): React.ReactNode {
  return (
    <div
      className={cn("w-full h-px shrink-0 opacity-20", className)}
      style={{
        background: `repeating-linear-gradient(90deg,var(--color-secondary),var(--color-secondary) 6px,transparent 6px,transparent 10px)`,
      }}
    />
  );
}
