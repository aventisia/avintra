import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { cn } from "@aventisia/ui/lib";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

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
      <div className="grid h-3 w-3 place-items-center rounded-full border-2 border-blue-300 bg-blue-200">
        <InputHandle
          position={targetPosition}
          className={cn(
            "opacity-0",
            sourcePosition === "bottom"
              ? "left-1.5 top-3.5"
              : "left-3.5 top-1.5",
          )}
        />
        <OutputHandle
          position={sourcePosition}
          className={cn(
            "opacity-0",
            sourcePosition === "bottom"
              ? "bottom-2.5 right-0"
              : "bottom-0 right-2",
          )}
        />
      </div>
    );
  },
);

BranchEndNode.displayName = "BranchEndNode";
