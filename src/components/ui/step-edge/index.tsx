import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import { StepEdgeLabel } from "./StepEdgeLabel";

export default function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 10,
  });

  return (
    <>
      <ChevronMarkerEnd />
      <BaseEdge
        className="stroke-slate-400 stroke-[1]"
        id={id}
        path={edgePath}
        markerEnd="url(#chevronMarkerEnd)"
      />
      {label && <StepEdgeLabel label={label} labelX={labelX} labelY={labelY} />}
    </>
  );
}
