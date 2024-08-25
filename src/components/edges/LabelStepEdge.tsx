import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import { EdgeLabelContainer } from "./EdgeLabelContainer";

export default function LabelStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 15,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <ChevronMarkerEnd />
      <BaseEdge
        className="stroke-slate-400 stroke-[1.3]"
        id={id}
        path={edgePath}
        markerEnd="url(#chevronMarkerEnd)"
      />
      {label && <EdgeLabelContainer label={label} labelX={labelX} labelY={labelY} />}
    </>
  );
}
