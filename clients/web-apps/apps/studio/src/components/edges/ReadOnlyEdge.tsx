import { cn } from "@avplatform/ui/lib";
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow } from "@xyflow/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";

import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import "./override-edge-style.css";
import { useEdgeRunState } from "./useEdgeRunState";

/** Built on top of CustomStepEdge to keep Execution edge design separate */
export const ReadOnlyEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    source,
    target,
  }: EdgeProps) => {
    const { getNode, getEdge } = useReactFlow();
    const nodeType = getNode(getEdge(id)?.target ?? "")?.type;

    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      targetX: nodeType == "flowEndNode" ? sourceX : targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    const isExecutionLog = useIsExecutionLogsRoute();

    const { traversedEdges, nodeToParentStack, activeIteration } = useExecutionStore(
      useShallow((state) => ({
        traversedEdges: state.traversedEdges,
        nodeToParentStack: state.nodeToParentStack,
        activeIteration: state.activeIteration,
      })),
    );

    const parents = nodeToParentStack[target] || [];
    const pathKey = parents.map((id) => activeIteration[id] ?? 0).join("-") || "global";

    // An edge is green only when the execution actually followed it in the selected path.
    //
    // This is deliberately keyed by EDGE, not by the target node. Several edges converge on
    // the same node — every branchEndNode points at the router's merge node — so checking
    // "did the target run?" lit up every converging edge as soon as the shared target ran,
    // including the branches that were never taken. The parser reconstructs the traversed
    // edges from log adjacency, mirroring the live canvas which receives the exact edge id
    // from the runner.
    const isActive = traversedEdges[id]?.[pathKey] === true;

    const runState = useEdgeRunState(source, target, isExecutionLog && isActive);
    const { stroke, className: statusClass } = isExecutionLog
      ? runState
      : { stroke: "var(--line-strong)", className: "" };

    return (
      <>
        {markerEnd && nodeType !== "flowEndNode" ? (
          <ChevronMarkerEnd edgeId={id} stroke={stroke} />
        ) : null}
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          className={cn("stroke-1", statusClass)}
          style={{ stroke }} // Explicit inline override to ensure color applies
        />
      </>
    );
  },
);
ReadOnlyEdge.displayName = "ReadOnlyEdge";
