import { cn } from "@aventisia/ui/lib";
import { CheckCircle2Icon, CircleXIcon } from "lucide-react";
import React, { useRef } from "react";

import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { useNodePopoverStore } from "@/features/execution-logs/stores/node-popover-store";
import { NodeDataType } from "@/types/node-data-type";

interface OpenNodeLogProps {
  nodeId: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export default function OpenNodeLog({
  nodeId,
  children,
  className,
  showIcon = true,
}: OpenNodeLogProps) {
  const {
    executionMap,
    executionHistoryMap,
    nodeToParentStack,
    activeIteration,
  } = useExecutionStore();

  const parents = nodeToParentStack[nodeId] || [];
  const pathKey =
    parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";

  const history = executionMap[nodeId] || {};
  const log = history[pathKey];
  const pathHistory = executionHistoryMap[nodeId]?.[pathKey] || [];

  const isSuccess = log?.isSuccess === true;
  const isError = log?.isSuccess === false;

  const isExecutionLog = useIsExecutionLogsRoute();
  const { openPopover, closePopover } = useNodePopoverStore();

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAttemptLabel = (retryAttempt: number) => {
    return retryAttempt <= 0
      ? "Default Attempt"
      : `Auto-Retry Attempt ${retryAttempt}`;
  };

  const getPopoverNodeData = () => {
    if (!log) return null;

    const attemptsForSameExecution = pathHistory
      .filter((entry) => entry.nodeExecutionId === log.nodeExecutionId)
      .sort((a, b) => a.retryAttempt - b.retryAttempt);

    const outputByAttempt =
      attemptsForSameExecution.length > 1
        ? Object.fromEntries(
            attemptsForSameExecution.map((entry) => [
              getAttemptLabel(entry.retryAttempt),
              entry.outputs,
            ]),
          )
        : log.outputs;

    return {
      ...log,
      outputs: outputByAttempt,
    } as unknown as NodeDataType;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isExecutionLog) return;
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimeout.current = setTimeout(() => {
      const popoverNodeData = getPopoverNodeData();
      if (!popoverNodeData) return;
      openPopover(nodeId, popoverNodeData, rect);
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
            isExecutionLog && isSuccess && "border-green-500 ",
            isExecutionLog && isError && "border-red-500 ",
            className,
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showIcon && log && (
            <>
              {isSuccess ? (
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
