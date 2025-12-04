"use client";

import { type ReactNode } from "react";

import { useOryxMessage, useOryxRetrievals } from "@contextualai/oryx-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { useRetrievalSelection } from "@/components/retrieval-selection-context";

type MarkdownProps = {
  /**
   * The markdown content to render.
   */
  children: string;
};

type CitationCapsuleProps = {
  /**
   * The citation number to display and look up.
   */
  citationNumber: number;
};

/**
 * Simple capsule used to render inline citations.
 * Clicking the capsule selects the corresponding retrieval for preview.
 */
function CitationCapsule({ citationNumber }: CitationCapsuleProps): ReactNode {
  const { retrievals } = useOryxRetrievals();
  const { messageId } = useOryxMessage();
  const selectionContext = useRetrievalSelection();

  const handleClick = () => {
    const retrieval = retrievals.find((r) => r.number === citationNumber);
    if (retrieval && messageId) {
      selectionContext?.setSelection({
        contentId: retrieval.contentId,
        messageId,
      });
    }
  };

  return (
    <span
      role={"button"}
      className={"cursor-pointer text-blue-500 hover:text-blue-700 transition"}
      onClick={handleClick}
    >
      [{citationNumber}]
    </span>
  );
}

/**
 * Tailwind-powered markdown component overrides for ReactMarkdown.
 */
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className={"mb-4 mt-6 text-2xl font-semibold text-neutral-900"}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className={"mb-3 mt-5 text-xl font-semibold text-neutral-900"}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className={"mb-2 mt-4 text-lg font-semibold text-neutral-900"}>
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className={"mb-2 mt-3 text-base font-semibold text-neutral-900"}>
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className={"mb-2 mt-3 text-sm font-semibold text-neutral-900"}>
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6
      className={
        "mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-600"
      }
    >
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className={"my-2 leading-normal text-neutral-900"}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul className={"my-3 list-disc space-y-1 pl-6 text-neutral-900"}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={"my-3 list-decimal space-y-1 pl-6 text-neutral-900"}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className={"text-neutral-900"}>{children}</li>,
  code: ({ children }) => (
    <code
      className={
        "rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-900"
      }
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      className={
        "my-4 overflow-x-auto rounded border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm leading-relaxed text-neutral-900"
      }
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className={"my-4 border-l-2 border-neutral-200 pl-4 text-neutral-600"}
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    // Hide citation placeholders.
    if (typeof children === "string" && children === "placeholder" && !href) {
      return null;
    }

    // Render citation capsules.
    if (typeof children === "string" && /^\d+$/.test(children) && !href) {
      return <CitationCapsule citationNumber={parseInt(children, 10)} />;
    }

    // Render normal links.
    return (
      <a
        href={href}
        className={
          "border-b border-neutral-900 text-neutral-900 transition hover:text-neutral-700"
        }
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <table
      className={
        "my-4 w-full border border-neutral-200 text-left text-sm text-neutral-900"
      }
    >
      {children}
    </table>
  ),
  thead: ({ children }) => (
    <thead className={"bg-neutral-50"}>{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className={"border-b border-neutral-200"}>{children}</tr>
  ),
  th: ({ children }) => <th className={"px-3 py-2 font-medium"}>{children}</th>,
  td: ({ children }) => <td className={"px-3 py-2"}>{children}</td>,
  hr: () => <hr className={"my-6 border-neutral-200"} />,
  strong: ({ children }) => (
    <strong className={"font-semibold"}>{children}</strong>
  ),
  em: ({ children }) => <em className={"italic"}>{children}</em>,
};

/**
 * Styled markdown renderer with GFM support, line breaks, and sanitized HTML.
 */
export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={markdownComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
