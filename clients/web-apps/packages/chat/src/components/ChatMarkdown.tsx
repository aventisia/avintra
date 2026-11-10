import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import { cn } from "@avplatform/ui/lib";
import { memo } from "react";
import remarkGfm from "remark-gfm";

import { chatProseComponents } from "../constants/chat-prose.constant";
import { ChatCodeBlock } from "./ChatCodeBlock";
import { ChatCopyButton } from "./ChatCopyButton";

const CodeHeader = ({ language, code }: CodeHeaderProps) => (
  <div className="mt-5 flex items-center justify-between rounded-t-xl border border-b-0 border-line bg-sunken py-1 pl-4 pr-1.5">
    <span className="font-mono text-xs lowercase text-muted-foreground">{language || "text"}</span>
    <ChatCopyButton text={code} label="Copy code" />
  </div>
);

const markdownComponents = memoizeMarkdownComponents({
  ...chatProseComponents,
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
