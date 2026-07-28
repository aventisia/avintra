import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";

import { cn } from "@avplatform/ui/lib";
import { NodeProps, Position } from "@xyflow/react";
import { memo } from "react";

export const MergeBranchesNode = memo(
  ({ targetPosition, sourcePosition }: NodeProps) => {
    return (
      <div className="h-4 cursor-none w-[1px] opacity-0">
        <InputHandle
          position={targetPosition}
          className={cn("opacity-0")}
          // TODO: Validate if connection is a branch
          // connectionCount={data?.incomingBranches as number} // Set to a high number to allow multiple connections
        />
        <OutputHandle position={sourcePosition} className={cn("opacity-0")} />
        <OutputHandle
          id="branch-return"
          position={Position.Right}
          className={cn("opacity-0")}
        />
      </div>
    );
  },
);

MergeBranchesNode.displayName = "MergeBranchesNode";
