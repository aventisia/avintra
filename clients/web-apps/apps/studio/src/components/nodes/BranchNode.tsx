import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";

import { cn } from "@avplatform/ui/lib";
import { NodeProps } from "@xyflow/react";
import { memo } from "react";

export const BranchNode = memo(
  ({ targetPosition, sourcePosition }: NodeProps) => {
    return (
      <div className="h-3 w-[1px] opacity-0">
        <InputHandle position={targetPosition} className={cn("opacity-0")} />
        <OutputHandle position={sourcePosition} className={cn("opacity-0")} />
      </div>
    );
  },
);

BranchNode.displayName = "BranchNode";
