import { Button, CopyButton } from "@avplatform/ui/buttons";
import { useEffect, useState } from "react";

import { CodeEditor } from "@/components/code-editor/CodeEditor";

import { type UiBuilderContentFormat } from "../constants/ui-builder-framework.constant";

type UiBuilderCodeViewProps = {
  html: string;
  source?: string | null;
  format?: UiBuilderContentFormat;
};

type UiBuilderCodeMode = "source" | "built";

const COPY_RESET_MS = 2000;

/** Read-only source view of the current builder document, with a Source/Built switch and copy. */
export const UiBuilderCodeView = ({ html, source, format }: UiBuilderCodeViewProps) => {
  const [mode, setMode] = useState<UiBuilderCodeMode>("source");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(() => setIsCopied(false), COPY_RESET_MS);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const hasSource = Boolean(source?.trim());
  const showModeSwitch = hasSource && format === "framework";
  const activeMode: UiBuilderCodeMode = showModeSwitch ? mode : "built";
  const displayed = activeMode === "source" ? (source ?? "") : html;

  const handleCopy = () => {
    void navigator.clipboard.writeText(displayed).then(() => setIsCopied(true));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            Code
          </span>
          {showModeSwitch && (
            <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5">
              <Button
                size="xs"
                variant={mode === "source" ? "secondary" : "ghost"}
                aria-pressed={mode === "source"}
                onClick={() => setMode("source")}
                className="h-5 rounded-sm px-2 text-2xs"
              >
                Source
              </Button>
              <Button
                size="xs"
                variant={mode === "built" ? "secondary" : "ghost"}
                aria-pressed={mode === "built"}
                onClick={() => setMode("built")}
                className="h-5 rounded-sm px-2 text-2xs"
              >
                Built
              </Button>
            </div>
          )}
        </div>
        <CopyButton isCopied={isCopied} onClick={handleCopy} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {displayed.trim() ? (
          <CodeEditor
            value={displayed}
            language={activeMode === "source" ? "javascript" : "html"}
            disabled
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white p-4 text-sm text-muted-foreground">
            Describe the interface you want, then send your first prompt.
          </div>
        )}
      </div>
    </div>
  );
};
