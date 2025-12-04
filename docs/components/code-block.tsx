import { CodeBlockCopyButton } from "@/components/code-block-copy-button";
import { codeToHtml } from "shiki";

type CodeBlockProps = Readonly<{
  /**
   * The programming language for syntax highlighting.
   */
  language: string;
  /**
   * The code content to be highlighted.
   */
  content: string;
}>;

/**
 * A server-side syntax-highlighted code block component powered by Shiki.
 * This is an async server component that renders highlighted code in MDX pages.
 */
export async function CodeBlock({
  language,
  content,
}: CodeBlockProps): Promise<React.ReactNode> {
  const html = await codeToHtml(content, {
    lang: language,
    theme: "github-light-default",
  });

  return (
    <div className={"w-full flex flex-col items-start"}>
      <div className={"w-full flex items-center justify-between px-3 pt-3"}>
        <p className={"text-xs text-secondary leading-none select-none"}>
          {language}
        </p>
        <CodeBlockCopyButton content={content} />
      </div>
      <div
        className={
          "w-full overflow-x-auto px-3 pt-2 pb-3 [&>pre]:bg-transparent! [&_code]:text-xs [&_code]:font-mono"
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
