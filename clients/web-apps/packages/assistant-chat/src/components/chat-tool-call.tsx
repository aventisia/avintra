import type { ToolCallMessagePartStatus } from "@assistant-ui/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@avplatform/ui/collapsible";
import { cn } from "@avplatform/ui/lib";
import {
  CaretRightIcon,
  CheckIcon,
  CircleNotchIcon,
  ProhibitIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { humanizeToolLabel } from "../lib/tool-labels";

export type ChatToolCallProps = {
  toolName: string;
  argsText?: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
  status?: ToolCallMessagePartStatus;
  className?: string;
};

/** Render a tool result as indented text, JSON-stringifying objects. */
const formatValue = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

/**
 * Compact, display-only tool-call row for server-executed chat-agent tools.
 *
 * Chat-agent tools run server-side in the graph, so this never executes
 * anything client-side: it shows the humanized tool name + status and expands
 * to the arguments and result.
 */
export const ChatToolCall = ({
  toolName,
  argsText,
  args,
  result,
  isError,
  status,
  className,
}: ChatToolCallProps) => {
  const [open, setOpen] = useState(false);

  const statusType = status?.type ?? (result === undefined ? "running" : "complete");
  const isRunning = statusType === "running";
  const isCancelled = status?.type === "incomplete" && status.reason === "cancelled";
  const isErrored = isError || (status?.type === "incomplete" && status.reason === "error");

  const resultText = formatValue(result);
  const argsValue = argsText && argsText !== "{}" ? argsText : formatValue(args);
  const hasDetails = Boolean(argsValue) || resultText !== null;

  const StatusIcon = isRunning
    ? CircleNotchIcon
    : isErrored
      ? WarningIcon
      : isCancelled
        ? ProhibitIcon
        : CheckIcon;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "aui-chat-tool-call w-full overflow-hidden rounded-lg border border-border/60 bg-muted/20",
        className,
      )}
    >
      <CollapsibleTrigger
        className={cn(
          "group/tool flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted/50",
          !hasDetails && "cursor-default hover:bg-transparent",
        )}
        disabled={!hasDetails}
      >
        <StatusIcon
          className={cn(
            "size-3.5 shrink-0",
            isRunning && "animate-spin text-primary",
            !isRunning && isErrored && "text-destructive",
            !isRunning && !isErrored && isCancelled && "text-muted-foreground",
            !isRunning && !isErrored && !isCancelled && "text-ok",
          )}
        />
        <span className={cn("min-w-0 flex-1 truncate", isCancelled && "line-through")}>
          {humanizeToolLabel(toolName)}
        </span>
        {hasDetails && (
          <CaretRightIcon className="size-3.5 shrink-0 opacity-60 transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
        )}
      </CollapsibleTrigger>

      {hasDetails && (
        <CollapsibleContent className="border-t border-border/60">
          <div className="space-y-2 px-3 py-2 text-xs">
            {argsValue && (
              <div>
                <div className="mb-1 font-medium text-muted-foreground">Arguments</div>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-border/50 bg-background/60 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {argsValue}
                </pre>
              </div>
            )}
            {resultText !== null && (
              <div>
                <div
                  className={cn(
                    "mb-1 font-medium",
                    isErrored ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {isErrored ? "Error" : "Result"}
                </div>
                <pre
                  className={cn(
                    "max-h-64 overflow-auto whitespace-pre-wrap rounded-md border bg-background/60 p-2 font-mono text-[11px] leading-relaxed",
                    isErrored
                      ? "border-destructive/40 text-destructive"
                      : "border-border/50 text-muted-foreground",
                  )}
                >
                  {resultText}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default ChatToolCall;
