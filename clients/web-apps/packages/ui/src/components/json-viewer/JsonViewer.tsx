import JsonView from "@uiw/react-json-view";
import { useMemo } from "react";

import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { cn } from "../../lib/utils";
import { CopyButton } from "../buttons/CopyButton";
import { ScrollArea } from "../scroll/ScrollArea";
import "./json-viewer.css";

const JSON_INDENT_WIDTH = 18;

/** Props for the per-row copy icon supplied by @uiw/react-json-view. */
type JsonCopiedRenderProps = {
  onClick?: () => void;
  "data-copied"?: boolean;
};

type JsonViewerProps = {
  /** JSON string to render. */
  jsonData: string;
  /** Render a top-right button that copies the full JSON. */
  showCopyAllButton?: boolean;
  /** Render a copy icon on each JSON value. */
  enableValueClipboard?: boolean;
  /** Optional root class name. */
  className?: string;
  /**
   * Custom classes applied to the internal viewport (controls scroll/height).
   * Defaults to `max-h-72` so content scrolls when it exceeds 18rem.
   * Pass an empty string or override to remove the max-height restriction
   * (e.g. when the viewer is already inside a scrolling container).
   */
  viewportClassName?: string;
  /**
   * Number of characters after which long string values are truncated.
   * Defaults to the internal constant `JSON_SHORTEN_AFTER_LENGTH`.
   */
  shortenTextAfterLength?: number;
  /**
   * Whether long string values should wrap onto multiple lines.
   * When `true` (default), long values wrap to stay inside the container.
   * When `false`, long values stay on a single line and the viewer shows a
   * horizontal scrollbar.
   */
  wrapLongValues?: boolean;
  /**
   * Attempt to recursively parse stringified JSON values within parsed
   * objects/arrays. Useful when the payload contains escaped JSON strings,
   * e.g. LLM responses that embed stringified objects inside a JSON envelope.
   */
  parseNestedStrings?: boolean;
};

const parseJsonRecursively = (value: unknown): unknown => {
  if (value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map(parseJsonRecursively);
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
      if (typeof entry === "string") {
        const trimmed = entry.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          try {
            return [key, parseJsonRecursively(JSON.parse(entry))];
          } catch {
            return [key, entry];
          }
        }
      }
      return [key, parseJsonRecursively(entry)];
    }),
  );
};

/**
 * Render pretty-printed JSON with monospace font and copy affordances.
 *
 * - `showCopyAllButton` adds a button that copies the complete JSON value.
 * - `enableValueClipboard` adds a copy icon to each JSON value via the underlying
 *   library's row-level copy feature, styled with the same icon as CopyButton.
 */
export const JsonViewer = ({
  jsonData,
  showCopyAllButton,
  enableValueClipboard = false,
  className,
  viewportClassName = "max-h-72",
  shortenTextAfterLength = 80,
  wrapLongValues = true,
  parseNestedStrings = false,
}: JsonViewerProps) => {
  const { parsedJson, parseError } = useMemo(() => {
    try {
      let parsed = JSON.parse(jsonData);
      if (parseNestedStrings) {
        parsed = parseJsonRecursively(parsed);
      }
      return { parsedJson: parsed, parseError: false };
    } catch {
      return { parsedJson: undefined, parseError: true };
    }
  }, [jsonData, parseNestedStrings]);

  const serializedJson = useMemo(
    () => (parseError ? jsonData : JSON.stringify(parsedJson, null, 2)),
    [jsonData, parseError, parsedJson],
  );

  const { isCopied, copy } = useCopyToClipboard();

  const handleCopyJson = () => {
    void copy(serializedJson);
  };

  const copiedAriaLabel = isCopied ? "Copied" : "Copy JSON";

  return (
    <ScrollArea
      className={cn(
        "relative w-full min-w-0 max-w-full pb-2",
        !wrapLongValues && "overflow-x-auto",
        className,
      )}
      viewportClassName={cn("w-full min-w-0", viewportClassName)}
      showHorizontalScrollbar
    >
      {showCopyAllButton && !parseError && (
        <div className="absolute right-3 top-2 z-10">
          <CopyButton
            isCopied={isCopied}
            showTooltip
            aria-label={copiedAriaLabel}
            onClick={handleCopyJson}
            className="text-muted-foreground/60 size-6 hover:text-primary opacity-60 hover:opacity-100"
            iconClassName="size-3.5"
          />
        </div>
      )}

      {parseError ? (
        <div className="min-w-0 px-1 py-2">
          <p className="text-xs font-medium text-destructive">Invalid JSON</p>
          <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
            {jsonData}
          </pre>
        </div>
      ) : (
        <div className="min-w-0 max-w-full">
          <JsonView
            value={parsedJson}
            enableClipboard={enableValueClipboard}
            displayDataTypes={false}
            indentWidth={JSON_INDENT_WIDTH}
            highlightUpdates={false}
            shortenTextAfterLength={shortenTextAfterLength}
            style={{ minWidth: 0, maxWidth: "100%" }}
            className={wrapLongValues ? "wrap-json-values" : undefined}
          >
            <JsonView.Copied render={renderCopiedButton} />
          </JsonView>
        </div>
      )}
    </ScrollArea>
  );
};

const renderCopiedButton = (props: unknown) => {
  const { onClick, "data-copied": dataCopied } = props as JsonCopiedRenderProps;
  const copied = dataCopied === true;

  return (
    <CopyButton
      isCopied={copied}
      showTooltip={false}
      aria-label={copied ? "Copied" : "Copy"}
      onClick={onClick}
      className="text-muted-foreground/60 size-3.5 hover:text-primary ml-1 inline-flex opacity-60 hover:opacity-100"
      iconClassName="size-3"
    />
  );
};
