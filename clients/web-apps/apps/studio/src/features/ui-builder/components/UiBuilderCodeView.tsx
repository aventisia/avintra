import { CopyButton } from "@avplatform/ui/buttons";
import { useEffect, useState } from "react";

import { CodeEditor } from "@/components/code-editor/CodeEditor";

type UiBuilderCodeViewProps = {
  html: string;
};

const COPY_RESET_MS = 2000;

/** Read-only HTML source view of the current builder document, with copy. */
export const UiBuilderCodeView = ({ html }: UiBuilderCodeViewProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(() => setIsCopied(false), COPY_RESET_MS);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const handleCopy = () => {
    void navigator.clipboard.writeText(html).then(() => setIsCopied(true));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5">
        <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          Code
        </span>
        <CopyButton isCopied={isCopied} onClick={handleCopy} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {html.trim() ? (
          <CodeEditor value={html} language="html" disabled />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white p-4 text-sm text-muted-foreground">
            Describe the interface you want, then send your first prompt.
          </div>
        )}
      </div>
    </div>
  );
};
