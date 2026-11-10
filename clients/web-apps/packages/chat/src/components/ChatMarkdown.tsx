import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import { cn } from "@avplatform/ui/lib";
import { memo } from "react";
import remarkGfm from "remark-gfm";

import { ChatCodeBlock } from "./ChatCodeBlock";
import { ChatCopyButton } from "./ChatCopyButton";

const CodeHeader = ({ language, code }: CodeHeaderProps) => (
  <div className="mt-5 flex items-center justify-between rounded-t-xl border border-b-0 border-line bg-sunken py-1 pl-4 pr-1.5">
    <span className="font-mono text-xs lowercase text-muted-foreground">{language || "text"}</span>
    <ChatCopyButton text={code} label="Copy code" />
  </div>
);

const markdownComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mb-3 mt-7 text-xl font-semibold tracking-tight first:mt-0", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mb-2.5 mt-6 text-lg font-semibold tracking-tight first:mt-0", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mb-2 mt-5 font-semibold first:mt-0", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cn("mb-2 mt-4 font-semibold first:mt-0", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("my-3 first:mt-0 last:mb-0", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors hover:decoration-primary",
        className,
      )}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold text-ink", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("my-4 border-l-2 border-line-strong pl-4 text-ink-2", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "my-3 ml-5 list-disc space-y-1.5 marker:text-muted-foreground [&_ol]:my-1.5 [&_ul]:my-1.5",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "my-3 ml-5 list-decimal space-y-1.5 marker:text-muted-foreground [&_ol]:my-1.5 [&_ul]:my-1.5",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => <li className={cn("pl-1", className)} {...props} />,
  hr: ({ className, ...props }) => <hr className={cn("my-6 border-line", className)} {...props} />,
  table: ({ className, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-line">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-b border-line bg-sunken px-3 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-line px-3 py-2 align-top [&[align=center]]:text-center [&[align=right]]:text-right [tr:last-child_&]:border-b-0",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "mb-5 overflow-x-auto rounded-b-xl border border-line bg-sunken p-4 font-mono text-[13px] leading-6",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock &&
            "rounded-md border border-line bg-sunken px-1.5 py-0.5 font-mono text-[0.85em]",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
  SyntaxHighlighter: ChatCodeBlock,
});

/** Streams the current message's markdown with GFM, code blocks and smooth reveal. */
export const ChatMarkdown = memo(function ChatMarkdown({
  preprocess,
}: {
  /** Rewrites the part's text before rendering. */
  preprocess?: (text: string) => string;
}) {
  return (
    <MarkdownTextPrimitive
      preprocess={preprocess}
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
      className="break-words"
      defer
    />
  );
});
