import { findRightmostNodePosition } from "@/utils/findRightmostNodePosition";
import { BaseEdge, EdgeProps, useEdges, useNodes } from "@xyflow/react";
import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import { memo } from "react";

export const LoopBackEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerEnd,
    target,
  }: EdgeProps) => {
    const nodes = useNodes();
    const edges = useEdges();

    const posData = findRightmostNodePosition(nodes, edges, target);

    if (!posData) return null;

    const { x: rightmostX, depth } = posData;

    const baseOffset = rightmostX / 1.6;

    // Push outer loops further out
    const loopSpacing = 2; // Distance between nested loops
    const adjustedOffset = baseOffset + loopSpacing * depth;

    const bendX = sourceX + Math.max(adjustedOffset, 200);
    const cornerRadius = -10;

    const path = `
      M ${sourceX},${sourceY}
      H ${bendX + cornerRadius}
      Q ${bendX},${sourceY} ${bendX},${sourceY + cornerRadius}
      V ${targetY - cornerRadius}
      Q ${bendX},${targetY} ${bendX + cornerRadius},${targetY}
      H ${targetX}
    `;

    return (
      <>
        {markerEnd ? <ChevronMarkerEnd edgeId={id} /> : null}
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          style={{
            strokeDasharray: "6 3",
            stroke: "#555",
            strokeWidth: 2,
            fill: "none",
          }}
        />
      </>
    );
  },
);

LoopBackEdge.displayName = "LoopBackEdge";
