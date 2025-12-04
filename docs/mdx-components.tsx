import "server-only";

import { CodeBlock } from "@/components/code-block";
import { DocsTitle } from "@/components/docs-title";
import { cn } from "@/lib/tailwind";
import type { MDXComponents } from "mdx/types";
import { AnchorTag } from "@/components/anchor-tag";
import { ParameterRow } from "@/components/parameter-row";
import { Divider } from "@/components/divider";
import { AfterContentNavigation } from "@/components/after-content-navigation";

/**
 * Define custom MDX components to be used across all MDX pages.
 * This is required for `@next/mdx` to work properly.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    DocsTitle,
    AnchorTag,
    ParameterRow,
    AfterContentNavigation,

    // ---------- Paragraphs ----------

    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={"text-base mb-5"} {...props}>
        {children}
      </p>
    ),

    a: ({
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        {...props}
        href={props.href}
        className={cn(
          "text-inherit underline underline-offset-2 decoration-1 transition-colors cursor-pointer",
          "text-brand decoration-brand/20 hover:decoration-brand/60 focus-visible:decoration-brand/60",
        )}
        target={
          props.target ||
          (props.href?.startsWith("http") ? "_blank" : undefined)
        }
      >
        {children}
      </a>
    ),

    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1
        {...props}
        className={cn(
          "text-base font-semibold text-primary mt-section-gap mb-3.5 relative",
          "before:content-['#'] before:absolute before:left-0 before:text-secondary/30",
          "before:-translate-x-full before:pr-1.5",
        )}
      >
        {children}
      </h1>
    ),

    blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
      return (
        <blockquote
          {...props}
          className={cn(
            "w-full block pl-3 border-l-2 border-secondary/30 mb-5",
            props.className,
          )}
        >
          {props.children}
        </blockquote>
      );
    },

    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img
        src={props.src}
        alt={props.alt}
        className={cn(
          "w-full h-auto overflow-clip bg-card rounded mb-5 select-none pointer-events-none",
          "outline-1 -outline-offset-1 outline-primary/6",
        )}
      />
    ),

    // ---------- Dividers ----------

    hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
      <Divider {...props} className={"my-section-gap"} />
    ),

    // ---------- Lists ----------

    ul: (props: React.HTMLAttributes<HTMLUListElement>) => {
      return (
        <ul
          {...props}
          className={cn(
            "list-[square] pl-4 mt-1 mb-5 [li>&]:mb-1 text-base text-primary marker:text-secondary/40",
            props.className,
          )}
        >
          {props.children}
        </ul>
      );
    },
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => {
      return (
        <ol
          {...props}
          className={cn(
            "list-decimal [li>&]:list-[lower-alpha] [li_li>&]:list-[lower-roman]",
            "pl-4 mt-1 mb-5 [li>&]:mb-1 text-base text-primary marker:text-secondary/75",
            props.className,
          )}
        >
          {props.children}
        </ol>
      );
    },
    li: (props: React.LiHTMLAttributes<HTMLLIElement>) => {
      return (
        <li
          {...props}
          className={cn("text-base text-primary my-1", props.className)}
        >
          {props.children}
        </li>
      );
    },

    // ---------- Code Blocks ----------

    pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => {
      return (
        <div className={"w-full block py-1 mb-5"}>
          <div
            className={cn(
              // By default, we don't add any padding to the code block.
              // Paddings and highlights will be handled in `code` tag with syntax highlighting.
              "w-full flex flex-col items-start justify-start overflow-clip bg-card rounded",
              // This is to make sure that when the generated code block does not have a language specified,
              // we still have the correct padding for it.
              "[&>code]:p-3 [&_code]:text-xs [&_code]:font-mono",
            )}
          >
            {children}
          </div>
        </div>
      );
    },
    code: async (props: React.HTMLAttributes<HTMLElement>) => {
      if (typeof props.children !== "string") {
        return <>{props.children}</>;
      }

      // Extract language from Markdown syntax that gets parsed into class name.
      const match = /language-(\w+)/.exec(props.className || "");

      return match ? (
        <CodeBlock language={match[1]} content={props.children} />
      ) : (
        <>
          {/**
           * Note: We should not use syntax highlighter in this case because we cannot distinguish
           * an inline code block from a body code block without sacrificing the client performance.
           * Thus, we handle the block styling in `pre` tag for body code block that does not have a language specified.
           */}
          <code
            className={cn(
              props.className,
              // This is used to fix multi-line wrapping issues when code block does not specify the language.
              "text-sm px-px font-mono whitespace-pre-wrap",
            )}
          >
            {props.children}
          </code>
        </>
      );
    },
  };
}
