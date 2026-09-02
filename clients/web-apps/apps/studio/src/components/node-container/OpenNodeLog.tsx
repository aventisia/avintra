import { cn } from "@avplatform/ui/lib";
import { CheckCircle2Icon, CircleXIcon, Loader2, RepeatIcon } from "lucide-react";
import React, { useRef } from "react";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { useNodePopoverStore } from "@/features/execution-logs/stores/node-popover-store";

interface OpenNodeLogProps {
  nodeId: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  showBorder?: boolean;
  isDisabled?: boolean;
}

export default function OpenNodeLog({
  nodeId,
  children,
  className,
  showIcon = true,
  showBorder = true,
  isDisabled = false,
}: OpenNodeLogProps) {
  const { executionMap, executionHistoryMap, nodeToParentStack, activeIteration } =
    useExecutionStore();

  const parents = nodeToParentStack[nodeId] || [];
  const pathKey = parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";

  const history = executionMap[nodeId] || {};
  const log = history[pathKey];
  const pathHistory = executionHistoryMap[nodeId]?.[pathKey] || [];

  const isSuccess = log?.isSuccess === true;
  const isError = log?.isSuccess === false;

  const isExecutionLog = useIsExecutionLogsRoute();
  const { openPopover, closePopover } = useNodePopoverStore();

  // Live status for a running local (unpublished) flow, driven by the RunnerApp over the
  // Tauri WebSocket. Only shows on the design canvas (not the execution-log route).
  // Disabled nodes are not executed, so suppress any live status (especially the running
  // spinner) that may still be broadcast for them.
  const liveStatus = useLiveExecutionStore((state) =>
    isDisabled ? undefined : state.liveExecutionMap[nodeId],
  );

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Attempt history for the currently active execution, ordered by retry sequence.
  // Used only for the retry badge count; the popover resolves its data reactively.
  const attemptsForSameExecution = log
    ? pathHistory
        .filter((entry) => entry.nodeExecutionId === log.nodeExecutionId)
        .sort((a, b) => a.retryAttempt - b.retryAttempt)
    : [];

  // First entry is always the default attempt, not a retry — subtract it from the total
  const retryCount =
    attemptsForSameExecution.length > 2 // make it `1` if need to show Badge for default attempt
      ? attemptsForSameExecution.length - 1
      : 0;

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isExecutionLog) return;
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimeout.current = setTimeout(() => {
      if (!executionMap[nodeId]?.[pathKey]) return;
      openPopover(nodeId, rect);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setTimeout(() => {
      if (!useNodePopoverStore.getState().isHoveringPopover) {
        closePopover();
      }
    }, 100);
  };

  return (
    <>
      {isExecutionLog ? (
        <div
          className={cn(
            "relative border rounded-lg",
            isExecutionLog && isSuccess && showBorder && "border-green-500",
            isExecutionLog && isError && showBorder && "border-red-500",
            className,
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showIcon && log && (
            <>
              {/* Success/Error Icon (Top Right) */}
              {isSuccess ? (
                <CheckCircle2Icon className="absolute right-1 top-1 h-[0.7rem] w-[0.7rem] text-green-600" />
              ) : (
                <CircleXIcon className="absolute right-1 top-1 h-[0.7rem] w-[0.7rem] text-red-500" />
              )}

              {/* 2. Retry Icon & Count (Bottom Left) */}
              {retryCount > 0 && (
                <div
                  className="absolute bottom-1 left-1 flex h-3 items-center justify-center gap-0.5 rounded-full border text-muted-foreground px-1.5"
                  aria-label={`Retried ${retryCount} time${retryCount > 1 ? "s" : ""}`}
                  title={`Retried ${retryCount} time${retryCount > 1 ? "s" : ""}`}
                >
                  <RepeatIcon className="h-2 w-2 shrink-0" />
                  {/* Small y-offset compensates for numeral optical alignment against the icon's bounding box */}
                  <span className="text-[0.5rem] font-medium leading-none  translate-y-[0.5px]">
                    {retryCount}
                  </span>
                </div>
              )}
            </>
          )}
          {children}
        </div>
      ) : liveStatus ? (
        <div
          className={cn(
            "relative border rounded-lg",
            liveStatus === "running" && showBorder && "border-blue-500",
            liveStatus === "success" && showBorder && "border-green-500",
            liveStatus === "failed" && showBorder && "border-red-500",
            className,
          )}
        >
          {showIcon && (
            <>
              {liveStatus === "running" ? (
                <Loader2 className="absolute right-1 top-1 h-[0.7rem] w-[0.7rem] animate-spin text-blue-600" />
              ) : liveStatus === "success" ? (
                <CheckCircle2Icon className="absolute right-1 top-1 h-[0.7rem] w-[0.7rem] text-green-600" />
              ) : (
                <CircleXIcon className="absolute right-1 top-1 h-[0.7rem] w-[0.7rem] text-red-500" />
              )}
            </>
          )}
          {children}
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
