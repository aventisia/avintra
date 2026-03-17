import { NodeProps } from "@xyflow/react";
import { memo } from "react";

import { InputHandle } from "../handles/InputHandle";

export const FlowEndNode = memo(({ targetPosition }: NodeProps) => {
  return (
    <div className="flex h-9 w-[1px]">
      <InputHandle position={targetPosition} />
    </div>
  );
});

FlowEndNode.displayName = "FlowEndNode";
