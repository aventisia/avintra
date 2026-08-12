import JsonView from "@uiw/react-json-view";
import { useMemo } from "react";

import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { cn } from "../../lib/utils";
import { CopyButton } from "../buttons/CopyButton";
import { ScrollArea } from "../scroll/ScrollArea";
import "./json-viewer.css";

const JSON_INDENT_WIDTH = 18;
const JSON_SHORTEN_AFTER_LENGTH = 80;

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
}: JsonViewerProps) => {
  const { parsedJson, parseError } = useMemo(() => {
    try {
      return { parsedJson: JSON.parse(jsonData), parseError: false };
    } catch {
      return { parsedJson: undefined, parseError: true };
    }
  }, [jsonData]);

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
      className={cn("relative w-full pb-2", className)}
      viewportClassName={viewportClassName}
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
        <div className="px-1 py-2">
          <p className="text-xs font-medium text-destructive">Invalid JSON</p>
          <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
            {jsonData}
          </pre>
        </div>
      ) : (
        <JsonView
          value={parsedJson}
          enableClipboard={enableValueClipboard}
          displayDataTypes={false}
          indentWidth={JSON_INDENT_WIDTH}
          highlightUpdates={false}
          shortenTextAfterLength={JSON_SHORTEN_AFTER_LENGTH}
        >
          <JsonView.Copied render={renderCopiedButton} />
        </JsonView>
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
