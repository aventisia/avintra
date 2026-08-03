import { cn } from "@avplatform/ui/lib";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";

type BranchEndNode = Node<
  {
    groupType: "CondtionalBranch" | "LoopBranch";
    customParentId: string;
  },
  "branchEndNode"
>;

export const BranchEndNode = memo(
  ({ targetPosition, sourcePosition }: NodeProps<BranchEndNode>) => {
    return (
      <div className="h-3 w-[1px] opacity-0">
        <InputHandle position={targetPosition} className={cn("opacity-0")} />
        <OutputHandle position={sourcePosition} className={cn("opacity-0")} />
      </div>
    );
  },
);

BranchEndNode.displayName = "BranchEndNode";
