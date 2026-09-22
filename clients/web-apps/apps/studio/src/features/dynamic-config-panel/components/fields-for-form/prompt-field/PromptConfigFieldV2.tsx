import { useCallback, useEffect, useMemo, useRef } from "react";
import { useController, useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { ChatAgentPromptAction } from "./ChatAgentPromptAction";

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

const LINE_HEIGHT = 20;
const CHARS_PER_TOKEN = 4;
// Matches the DCP tab scroll area height (tab-list 4rem + footer 4rem + DCP
// header) minus its inner paddings/borders so the editor fits without the tab
// scrolling.
const FILL_HEIGHT = "calc(100vh - 13.25rem - var(--header-height) - var(--header-padding) - 1rem)";

interface PromptConfigFieldV2Props {
  name: string;
  disabled?: boolean;
  showTokenCount?: boolean;
  showVariables?: boolean;
}

// Extract the unique variable names referenced as {{name}} in the prompt.
const extractVariables = (value: string) => {
  const variables = new Set<string>();
  for (const match of value.matchAll(VARIABLE_PATTERN)) {
    variables.add(match[1]);
  }
  return Array.from(variables);
};

const PromptConfigFieldV2 = ({
  name,
  disabled,
  showTokenCount = false,
  showVariables = false,
}: PromptConfigFieldV2Props) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });

  const { isChatAgent } = useCurrentFlowStore(
    useShallow((state) => ({
      isChatAgent: state.isChatAgent,
    })),
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const value = typeof field.value === "string" ? field.value : "";

  const lineCount = useMemo(() => Math.max(value.split("\n").length, 1), [value]);
  const variables = useMemo(
    () => (showVariables ? extractVariables(value) : []),
    [value, showVariables],
  );
  const tokenCount = useMemo(() => Math.round(value.length / CHARS_PER_TOKEN), [value]);
  const showFooter = showTokenCount || showVariables;

  // Keep the line-number gutter scrolled in step with the textarea.
  const syncScroll = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (gutterRef.current) gutterRef.current.scrollTop = textarea.scrollTop;
  }, []);

  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  const insertVariable = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const next = value.slice(0, start) + "{{}}" + value.slice(textarea.selectionEnd);

    field.onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2);
    });
  };

  return (
    <div className="flex min-h-[15rem] w-full flex-col" style={{ height: FILL_HEIGHT }}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-input transition-shadow focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring">
        <div className="flex min-h-0 flex-1" onMouseDown={() => textareaRef.current?.focus()}>
          <div
            ref={gutterRef}
            aria-hidden
            className="w-9 shrink-0 overflow-hidden border-r border-input bg-muted py-2 text-right font-mono text-sm text-muted-foreground"
          >
            {Array.from({ length: lineCount }, (_, index) => index + 1).map((line) => (
              <div
                key={line}
                className="px-1.5 font-mono text-muted-foreground text-2xs"
                style={{ height: LINE_HEIGHT, lineHeight: `${LINE_HEIGHT}px` }}
              >
                {line}
              </div>
            ))}
          </div>

          <div className="relative min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              disabled={disabled}
              spellCheck={false}
              placeholder="Enter the prompt..."
              onChange={(event) => field.onChange(event.target.value)}
              onScroll={syncScroll}
              className="prompt-editor-scroll absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground selection:bg-primary/20"
              style={{ lineHeight: `${LINE_HEIGHT}px` }}
            />
          </div>
        </div>

        {showFooter && (
          <div className="flex shrink-0 items-start justify-between gap-3 border-t border-input bg-muted/40 px-3 py-2 text-xs">
            <div className="flex shrink-0 items-center gap-2 font-mono text-muted-foreground">
              {showTokenCount && (
                <span>
                  ~<span className="font-medium text-foreground mr-0.5">{tokenCount}</span> tokens
                </span>
              )}
              {showTokenCount && showVariables && (
                <span className="block rounded-full size-[0.2rem] bg-slate-400" />
              )}
              {showVariables && (
                <span>
                  <span className="font-medium text-foreground mr-0.5">{variables.length}</span>{" "}
                  variables
                </span>
              )}
            </div>

            {showVariables &&
              (variables.length > 0 ? (
                <div className="flex min-w-0 flex-wrap justify-end gap-1">
                  {variables.map((variable) => (
                    <span
                      key={variable}
                      className="rounded bg-primary-100 px-1.5 py-0.5 font-mono text-3xs text-primary-700"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use{" "}
                  <button
                    type="button"
                    onClick={insertVariable}
                    className="rounded bg-primary-100 px-1 font-mono text-primary-700"
                  >
                    {"{{ }}"}
                  </button>{" "}
                  to insert a variable.
                </p>
              ))}
          </div>
        )}
      </div>

      {isChatAgent && (
        <div className="mt-2 flex items-center justify-start">
          <ChatAgentPromptAction name={name} disabled={disabled} />
        </div>
      )}
    </div>
  );
};

PromptConfigFieldV2.displayName = "PromptConfigFieldV2";

export { PromptConfigFieldV2 };
