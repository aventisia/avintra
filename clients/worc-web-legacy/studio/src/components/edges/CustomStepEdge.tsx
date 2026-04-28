import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

import { cn } from "@aventisia/ui/lib";
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react";
import { memo } from "react";

import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import { EdgeLabelContainer } from "./EdgeLabelContainer";
import "./override-edge-style.css";

export const CustomStepEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    label,
    source,
    target,
  }: EdgeProps) => {
    const { getNode, getEdge } = useReactFlow();
    const nodeType = getNode(getEdge(id)?.target ?? "")?.type;

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX: nodeType == "flowEndNode" ? sourceX : targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    const isAgentHistory = useIsVersionHistoryRoute();
    const isExecutionLog = useIsExecutionLogsRoute();

    const {
      executionMap,
      nodeToParentStack,
      activeIteration,
      routerConfig,
      routerVisits,
      routerTruePaths,
    } = useExecutionStore();

    const parents = nodeToParentStack[target] || [];
    const pathKey =
      parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";

    let isActive = false;
    const isTargetRouterBranch = routerConfig[source];

    if (isTargetRouterBranch) {
      if (target === isTargetRouterBranch.defaultId) {
        // --- Default Path Inference Logic ---
        const visited = routerVisits[source]?.has(pathKey);
        const conditionalsTrue = routerTruePaths[source]?.has(pathKey);
        isActive = !!visited && !conditionalsTrue;
      } else {
        // --- Conditional Branch Edge ---
        isActive =
          executionMap[target]?.[pathKey]?.outputs?.ConditionsResult === "True";
      }
    } else {
      // --- Standard Edge ---
      isActive = !!executionMap[target]?.[pathKey];
    }

    const stroke = isExecutionLog && isActive ? "#22c55e" : "#94a3b8";
    const statusClass = isExecutionLog && isActive ? "edge-success" : "";

    return (
      <>
        {markerEnd && nodeType !== "flowEndNode" ? (
          <ChevronMarkerEnd edgeId={id} stroke={stroke} />
        ) : null}
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          className={cn("stroke-1 ", statusClass)}
          style={{ stroke }} // Explicit inline override to ensure color applies
        />
        {label && !isAgentHistory && !isExecutionLog ? (
          <EdgeLabelContainer
            edgeId={id}
            label={label}
            labelX={nodeType == "flowEndNode" ? labelX + 16 : labelX}
            labelY={labelY}
          />
        ) : null}
      </>
    );
  },
);
CustomStepEdge.displayName = "CustomStepEdge";
