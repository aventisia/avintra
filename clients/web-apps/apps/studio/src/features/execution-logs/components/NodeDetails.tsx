import { Button } from "@avplatform/ui/buttons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { useExecutionStore } from "../stores/execution-log-store";
import { useNodePopoverStore } from "../stores/node-popover-store";
import FELInputOutput from "./FELInputOutput/FELInputOutput";

export const NodeDetail = ({ nodeId }: { nodeId: string }) => {
  const { openNodeId } = useNodePopoverStore();
  const effectiveNodeId = openNodeId ?? nodeId;

  const {
    loopRegistry,
    activeIteration,
    setIteration,
    executionMap,
    executionHistoryMap,
    nodeToParentStack,
    nodeTypes,
  } = useExecutionStore();

  const nodeType = nodeTypes[effectiveNodeId];

  // Resolve the log for the currently selected iteration path.
  const parents = nodeToParentStack[effectiveNodeId] || [];
  const pathKey = parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";
  const log = executionMap[effectiveNodeId]?.[pathKey];
  const pathHistory = executionHistoryMap[effectiveNodeId]?.[pathKey] || [];

  // Build attempt-by-attempt outputs when retries exist.
  const getAttemptLabel = (retryAttempt: number) =>
    retryAttempt <= 0 ? "Default Attempt" : `Auto-Retry Attempt ${retryAttempt}`;

  const attemptsForSameExecution = log
    ? pathHistory
        .filter((entry) => entry.nodeExecutionId === log.nodeExecutionId)
        .sort((a, b) => a.retryAttempt - b.retryAttempt)
    : [];

  const outputsByAttempt =
    attemptsForSameExecution.length > 1
      ? Object.fromEntries(
          attemptsForSameExecution.map((entry) => [
            getAttemptLabel(entry.retryAttempt),
            entry.outputs,
          ]),
        )
      : log?.outputs;

  const current = activeIteration[effectiveNodeId] || 0;
  const total = loopRegistry[effectiveNodeId]?.total || 0;

  // Show a breadcrumb for child nodes that live inside one or more loops.
  const iterationBreadcrumb =
    parents.length > 0 ? parents.map((id) => (activeIteration[id] ?? 0) + 1).join(" / ") : null;

  return (
    <div className="flex flex-col bg-background gap-2 p-2">
      {nodeType === "forLoopNode" && total > 0 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon5"
            onClick={(e) => {
              e.stopPropagation();
              setIteration(effectiveNodeId, Math.max(0, current - 1));
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="text-xs">
            {current + 1} / {total}
          </span>
          <Button
            variant="ghost"
            size="icon5"
            onClick={(e) => {
              e.stopPropagation();
              setIteration(effectiveNodeId, Math.min(total - 1, current + 1));
            }}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      )}

      {iterationBreadcrumb && (
        <div className="text-xs text-muted-foreground">Iteration: {iterationBreadcrumb}</div>
      )}

      <FELInputOutput title="Input" jsonData={JSON.stringify(log?.inputs, null, 2) || "{}"} />
      <FELInputOutput title="Output" jsonData={JSON.stringify(outputsByAttempt, null, 2) || "{}"} />
    </div>
  );
};
