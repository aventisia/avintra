import { cn } from "@/react-toolkit/lib/utils";
import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import "./override-edge-style.css";

export default function PlaceholderEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 20,
    sourcePosition,
    targetPosition,
  });

  return (
    <BaseEdge
      className={cn("stroke-slate-400 stroke-[1.5]")}
      id={id}
      path={edgePath}
      style={{ ...style, strokeDasharray: "5,5" }}
    />
  );
}
