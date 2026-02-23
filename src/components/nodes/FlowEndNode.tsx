import { NodeProps } from "@xyflow/react";
import { InputHandle } from "../handles/InputHandle";
import { memo } from "react";

export const FlowEndNode = memo(({ targetPosition }: NodeProps) => {
  return (
    <div className="flex h-6 w-14 items-center justify-center gap-2 rounded-full border-2 border-[--flow-border-end] bg-[--flow-end] text-3xs">
      <span>End</span>
      <InputHandle position={targetPosition} />
    </div>
  );
});

FlowEndNode.displayName = "FlowEndNode";
