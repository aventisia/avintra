import { Button, CopyButton } from "@avplatform/ui/buttons";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { CodeEditor } from "@/components/code-editor/CodeEditor";

import { type UiBuilderContentFormat } from "../constants/ui-builder-framework.constant";
import { UiBuilderDiffView } from "./UiBuilderDiffView";

/** An earlier version offered as a comparison base in the Changes view. */
export type UiBuilderCompareVersion = {
  versionNumber: number;
  label?: string | null;
  code: string;
};

type UiBuilderCodeViewProps = {
  html: string;
  source?: string | null;
  format?: UiBuilderContentFormat;
  compareVersions?: UiBuilderCompareVersion[];
  onDownloadHtml?: () => void;
  onDownloadSource?: () => void;
};

type UiBuilderCodeMode = "source" | "built" | "changes";

const COPY_RESET_MS = 2000;

/** Read-only source view of the current builder document, with a Source/Built switch and copy. */
export const UiBuilderCodeView = ({
  html,
  source,
  format,
  compareVersions = [],
  onDownloadHtml,
  onDownloadSource,
}: UiBuilderCodeViewProps) => {
  const [mode, setMode] = useState<UiBuilderCodeMode>("source");
  const [compareTo, setCompareTo] = useState<number | null>(null);
  const compareBase =
    compareVersions.find((version) => version.versionNumber === compareTo) ?? compareVersions[0];
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(() => setIsCopied(false), COPY_RESET_MS);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const hasSource = Boolean(source?.trim());
  const showModeSwitch = hasSource && format === "framework";
  const activeMode: UiBuilderCodeMode =
    mode === "changes" && compareBase ? "changes" : showModeSwitch ? mode : "built";
  const currentCode = hasSource && format === "framework" ? (source ?? "") : html;
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
          {(showModeSwitch || compareVersions.length > 0) && (
            <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5">
              {showModeSwitch && (
                <>
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
                </>
              )}
              {compareVersions.length > 0 && (
                <Button
                  size="xs"
                  variant={activeMode === "changes" ? "secondary" : "ghost"}
                  aria-pressed={activeMode === "changes"}
                  onClick={() => setMode("changes")}
                  className="h-5 rounded-sm px-2 text-2xs"
                >
                  Changes
                </Button>
              )}
            </div>
          )}
          {activeMode === "changes" && compareBase && (
            <label className="flex items-center gap-1 text-2xs text-slate-500">
              vs
              <select
                value={compareBase.versionNumber}
                onChange={(event) => setCompareTo(Number(event.target.value))}
                className="h-6 rounded border border-slate-200 bg-white px-1 text-2xs text-slate-700"
              >
                {compareVersions.map((version) => (
                  <option key={version.versionNumber} value={version.versionNumber}>
                    v{version.versionNumber}
                    {version.label ? ` · ${version.label}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onDownloadSource && hasSource && format === "framework" && (
            <Button
              size="xs"
              variant="ghost"
              onClick={onDownloadSource}
              className="h-6 gap-1 px-2 text-2xs"
            >
              <Download className="h-3 w-3" />
              .jsx
            </Button>
          )}
          {onDownloadHtml && html.trim() && (
            <Button
              size="xs"
              variant="ghost"
              onClick={onDownloadHtml}
              className="h-6 gap-1 px-2 text-2xs"
            >
              <Download className="h-3 w-3" />
              .html
            </Button>
          )}
          <CopyButton isCopied={isCopied} onClick={handleCopy} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {activeMode === "changes" && compareBase ? (
          <UiBuilderDiffView before={compareBase.code} after={currentCode} />
        ) : displayed.trim() ? (
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
