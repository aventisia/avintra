import { EDGE_BORDER_RADIUS } from "@/constants";
import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import { EdgeLabelContainer } from "./EdgeLabelContainer";
import "./override-edge-style.css";

export default function CustomStepEdge({
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
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: EDGE_BORDER_RADIUS,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      {markerEnd ? <ChevronMarkerEnd edgeId={id} /> : null}
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {label ? (
        <EdgeLabelContainer
          edgeId={id}
          label={label}
          labelX={labelX}
          labelY={labelY}
        />
      ) : null}
    </>
  );
}
