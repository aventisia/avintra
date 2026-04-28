import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { useNodePopoverStore } from "@/features/execution-logs/stores/node-popover-store";
import { NodeDataType } from "@/types/node-data-type";

import { cn } from "@aventisia/ui/lib";
import { CheckCircle2Icon, CircleXIcon } from "lucide-react";
import React, { useRef } from "react";

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
  const { executionMap, nodeToParentStack, activeIteration } =
    useExecutionStore();

  const parents = nodeToParentStack[nodeId] || [];
  const pathKey =
    parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";

  const history = executionMap[nodeId] || {};
  const log = history[pathKey];

  const isSuccess = log?.isSuccess === true;
  const isError = log?.isSuccess === false;

  const isExecutionLog = useIsExecutionLogsRoute();
  const { openPopover, closePopover } = useNodePopoverStore();

  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isExecutionLog) return;
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimeout.current = setTimeout(() => {
      openPopover(nodeId, log as unknown as NodeDataType, rect);
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
