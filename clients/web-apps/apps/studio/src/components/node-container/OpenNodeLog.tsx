import { cn } from "@avplatform/ui/lib";
import { RepeatIcon } from "@phosphor-icons/react";
import React from "react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { NODE_DETAIL_PANEL_ID } from "@/features/execution-logs/constants";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { useNodeDetailStore } from "@/features/execution-logs/stores/node-detail-store";

interface OpenNodeLogProps {
  nodeId: string;
  children: React.ReactNode;
  className?: string;
}

export default function OpenNodeLog({ nodeId, children, className }: OpenNodeLogProps) {
  const { executionMap, executionHistoryMap, nodeToParentStack, activeIteration } =
    useExecutionStore(
      useShallow((state) => ({
        executionMap: state.executionMap,
        executionHistoryMap: state.executionHistoryMap,
        nodeToParentStack: state.nodeToParentStack,
        activeIteration: state.activeIteration,
      })),
    );

  const parents = nodeToParentStack[nodeId] || [];
  const pathKey = parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";

  const history = executionMap[nodeId] || {};
  const log = history[pathKey];
  const pathHistory = executionHistoryMap[nodeId]?.[pathKey] || [];

  const isExecutionLog = useIsExecutionLogsRoute();
  const { openPanel } = usePanelStore(useShallow((state) => ({ openPanel: state.openPanel })));

  // Attempt history for the currently active execution, ordered by retry sequence.
  // Used only for the retry badge count; the panel resolves its data reactively.
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

  // Opens the docked node-log panel for this node. Replaces the old hover popover so the
  // full log metadata stays visible while the user inspects values.
  const handleOpenLog = () => {
    if (!isExecutionLog) return;
    if (!executionMap[nodeId]?.[pathKey]) return;

    useNodeDetailStore.getState().openNodeDetail(nodeId);
    openPanel(NODE_DETAIL_PANEL_ID, "right");
  };

  if (!isExecutionLog) return <>{children}</>;

  return (
    <div className={cn("relative", log && "cursor-pointer", className)} onClick={handleOpenLog}>
      {retryCount > 0 && (
        <div
          className="absolute -bottom-2 left-2 z-10 flex h-4 items-center gap-0.5 rounded-full border border-line bg-surface px-1.5 text-muted-foreground"
          aria-label={`Retried ${retryCount} time${retryCount > 1 ? "s" : ""}`}
          title={`Retried ${retryCount} time${retryCount > 1 ? "s" : ""}`}
        >
          <RepeatIcon className="size-2.5 shrink-0" />
          <span className="text-[0.625rem] font-medium leading-none">{retryCount}</span>
        </div>
      )}
      {children}
    </div>
  );
}
