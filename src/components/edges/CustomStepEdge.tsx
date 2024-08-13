import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { ChevronMarkerEnd } from "./ChevronMarkerEnd";
import "./override-edge-style.css";
import { AddNodeFromEdge } from "./AddNodeFromEdge";
import { NodeSelector } from "../node-selector";

export default function CustomStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 20,
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
      <NodeSelector
        origin="CustomStepEdge"
        originId={id}
        sideOffset={10}
        alignOffset={-12}
      >
        <AddNodeFromEdge labelX={labelX} labelY={labelY} />
      </NodeSelector>
    </>
  );
}
