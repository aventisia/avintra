import { CopyButton } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import * as React from "react";

/**
 * Props for the {@link Code} component.
 *
 * Extends native `div` props and renders a simple code block with a file name
 * header, a copy-to-clipboard button, and a plain-text code snippet. No syntax
 * highlighting is applied.
 */
export type CodeProps = React.ComponentPropsWithoutRef<"div"> & {
  /** The code snippet rendered inside the block. */
  code: string;
  /** File name displayed in the header. */
  filename?: string;
  /** Whether to show the copy button. */
  showCopyButton?: boolean;
  /** Whether to show a tooltip on the copy button. */
  showCopyTooltip?: boolean;
  /** Whether line numbers are shown. */
  showLineNumbers?: boolean;
};

/**
 * Escapes HTML special characters so raw code can be rendered safely.
 */
function escapeCode(code: string): string {
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * A simple code block component.
 *
 * Renders a file name header with a copy button and a scrollable, plain-text
 * code snippet. No syntax highlighting is applied, keeping the implementation
 * lightweight and dependency-free.
 */
export function Code({
  code,
  filename,
  showCopyButton = true,
  showCopyTooltip = true,
  showLineNumbers = false,
  className,
  ...props
}: CodeProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = React.useMemo(
    () => code.split(/\r?\n/).filter((line, index, arr) => line !== "" || index !== arr.length - 1),
    [code],
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = () => {
    if (!navigator.clipboard?.writeText) return;

    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    });
  };

  const lineNumberWidth = String(lines.length).length;

  return (
    <div
      data-slot="code"
      className={cn(
        "bg-muted/50 overflow-hidden rounded-xl border border-border text-sm text-foreground",
        className,
      )}
      {...props}
    >
      {/* Header */}
      <div
        data-slot="code-header"
        className="flex items-center justify-between gap-2 border-b border-border py-1 pl-3 pr-1"
      >
        {filename ? (
          <span
            data-slot="code-filename"
            className="my-1 text-xs font-medium text-muted-foreground"
          >
            {filename}
          </span>
        ) : (
          <span />
        )}

        {showCopyButton && (
          <CopyButton
            isCopied={isCopied}
            onClick={handleCopy}
            showTooltip={showCopyTooltip}
            className="h-[1.8em] w-[1.8em] text-[1.2em] opacity-60 hover:opacity-100"
          />
        )}
      </div>

      {/* Code snippet */}
      <ScrollArea showHorizontalScrollbar viewportClassName="max-h-[350px]" className="w-full">
        <pre className="p-4 font-mono text-sm leading-relaxed">
          <code className="block w-max min-w-full whitespace-pre">
            {showLineNumbers ? (
              lines.map((line, index) => {
                const lineNumber = index + 1;

                return (
                  <div key={index} className="flex items-start gap-3">
                    <span
                      className="shrink-0 select-none text-right text-xs leading-relaxed text-muted-foreground"
                      style={{ minWidth: `${lineNumberWidth}ch` }}
                    >
                      {lineNumber}
                    </span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: escapeCode(line) || "&nbsp;",
                      }}
                    />
                  </div>
                );
              })
            ) : (
              <span dangerouslySetInnerHTML={{ __html: escapeCode(code) }} />
            )}
          </code>
        </pre>
      </ScrollArea>
    </div>
  );
}

Code.displayName = "Code";
