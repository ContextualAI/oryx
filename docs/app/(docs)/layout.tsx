import { cn } from "@/lib/tailwind";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s - Oryx by Contextual AI",
    default: "Oryx by Contextual AI",
  },
};

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function Layout({ children }: LayoutProps) {
  return (
    <main
      className={cn(
        "w-full max-w-body-container shrink-0 grow block mx-auto px-body-edge pt-body-head",
      )}
    >
      {children}
      <div className={"w-full my-40 flex flex-col gap-0.5"}>
        <p className={"text-secondary text-xs"}>© 2025 Contextual AI, Inc.</p>
        <p className={"text-secondary/50 text-xs"}>
          Proudly open sourced under the Apache 2.0 license.
        </p>
      </div>
    </main>
  );
}
