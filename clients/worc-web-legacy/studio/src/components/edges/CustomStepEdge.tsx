// import { EDGE_BORDER_RADIUS } from "@/constants";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

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
    style,
    markerEnd,
    label,
  }: EdgeProps) => {
    const { getNode, getEdge } = useReactFlow();
    const nodeType = getNode(getEdge(id)?.target ?? "")?.type;

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

    return (
      <>
        {markerEnd && nodeType !== "flowEndNode" ? (
          <ChevronMarkerEnd edgeId={id} />
        ) : null}
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={style}
          className="stroke-1"
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
