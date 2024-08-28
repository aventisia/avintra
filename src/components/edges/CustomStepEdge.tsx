import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { NodeSelector } from "../node-selector";
import { AddNodeFromEdge } from "./AddNodeFromEdge";
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
      <ChevronMarkerEnd edgeId={id} />
      <BaseEdge
        className="stroke-[1.3]"
        id={id}
        path={edgePath}
        markerEnd={`url(#markerArrow_${id})`}
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
