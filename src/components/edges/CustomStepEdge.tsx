import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import "./override-edge-style.css";

export default function CustomStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
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
    </>
  );
}
