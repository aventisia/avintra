// import { EDGE_BORDER_RADIUS } from "@/constants";
import { cn } from "@avplatform/ui/lib";
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow } from "@xyflow/react";
import { memo } from "react";

import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
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
  }: EdgeProps) => {
    const { getNode, getEdge } = useReactFlow();
    const nodeType = getNode(getEdge(id)?.target ?? "")?.type;

    const isLiveEdgeActive = useLiveExecutionStore(
      (state) => state.liveTraversedEdges[id] === true,
    );

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

    const stroke = isLiveEdgeActive ? "#22c55e" : "#94a3b8";
    const statusClass = isLiveEdgeActive ? "edge-success" : "";

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
