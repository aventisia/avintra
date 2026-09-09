// import { EDGE_BORDER_RADIUS } from "@/constants";
import { cn } from "@avplatform/ui/lib";
import { BaseEdge, EdgeProps, getBezierPath, useNodes, useReactFlow } from "@xyflow/react";
import { memo, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import {
  buildLiveLoopIndex,
  getLiveNodeLog,
  isLiveRouterBranchActive,
} from "@/features/execute-flow/utils/live-loop-index";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

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
    style,
    markerEnd,
    label,
    source,
    target,
  }: EdgeProps) => {
    const { getNode, getEdge } = useReactFlow();
    const nodes = useNodes();
    const [searchParams] = useSearchParams();
    const subflowCallerId = searchParams.get("ci") || "";
    const nodeType = getNode(getEdge(id)?.target ?? "")?.type;

    const { liveTraversedEdges, nodeLogHistory, liveActiveIteration } = useLiveExecutionStore(
      useShallow((state) => ({
        liveTraversedEdges: state.liveTraversedEdges,
        nodeLogHistory: state.nodeLogHistory,
        liveActiveIteration: state.liveActiveIteration,
      })),
    );

    const liveExecutionData = useMemo(
      () => buildLiveLoopIndex(nodeLogHistory, nodes),
      [nodeLogHistory, nodes],
    );

    const router = liveExecutionData.routerConfig[source];
    const liveSourceLog = getLiveNodeLog(
      liveExecutionData,
      subflowCallerId,
      source,
      liveActiveIteration,
    );
    const liveTargetLog = getLiveNodeLog(
      liveExecutionData,
      subflowCallerId,
      target,
      liveActiveIteration,
    );
    const isLivePathActive = nodeLogHistory.length > 0
      ? router
        ? isLiveRouterBranchActive(
            liveExecutionData,
            subflowCallerId,
            source,
            target,
            liveActiveIteration,
          )
        : liveSourceLog?.isSuccess === true && liveTargetLog?.isSuccess === true
      : liveTraversedEdges[id] === true;

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX: nodeType == "flowEndNode" ? sourceX : targetX,
      targetY,
      // borderRadius: EDGE_BORDER_RADIUS,
      sourcePosition,
      targetPosition,
      // curvature:0
    });

    const isAgentHistory = useIsVersionHistoryRoute();

    const stroke = isLivePathActive ? "#22c55e" : "#94a3b8";
    const statusClass = isLivePathActive ? "edge-success" : "";

    return (
      <>
        {markerEnd && nodeType !== "flowEndNode" ? (
          <ChevronMarkerEnd edgeId={id} stroke={stroke} />
        ) : null}
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={style}
          className={cn("stroke-1 ", statusClass)}
        />
        {label && !isAgentHistory ? (
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
