import { cn } from "@/lib/tailwind";
import Link from "next/link";

type LinkDefinition = Readonly<{
  label: string;
  href: string;
  external?: boolean;
}>;

const LINKS: LinkDefinition[] = [
  {
    label: "GitHub",
    href: "https://github.com/ContextualAI/oryx",
    external: true,
  },
  {
    label: "Directory",
    href: "/#directory",
  },
  {
    label: "llms.txt",
    href: "/llms.txt",
    external: true,
  },
];

export function Hero(): React.ReactNode {
  return (
    <div className={"w-full flex flex-col items-start gap-1 mb-section-gap"}>
      <h1 className={"w-full text-lg font-semibold text-brand"}>
        Oryx
        <span className={"text-primary"}> by Contextual AI</span>
      </h1>
      <p className={"w-full text-base text-secondary"}>
        Integrate your application with Contextual AI agents — seamlessly, from
        interface to proxy, fully customizable and unbranded.
      </p>
      <div
        className={
          "w-full flex flex-row flex-wrap items-start gap-x-3 gap-y-0.5 mt-4"
        }
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            className={cn(
              "text-sm underline underline-offset-2 decoration-1 transition-colors cursor-pointer",
              "text-secondary hover:text-primary focus-visible:text-primary",
              "decoration-transparent hover:decoration-primary/25 focus-visible:decoration-primary/25",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
