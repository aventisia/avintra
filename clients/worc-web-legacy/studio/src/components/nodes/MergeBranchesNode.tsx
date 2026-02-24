import { InputHandle } from "@/components/handles/InputHandle";
import { NodeProps, Position } from "@xyflow/react";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { Merge } from "lucide-react";
import { cn } from "@aventisia/ui/lib";
import { memo } from "react";

export const MergeBranchesNode = memo(
  ({ targetPosition, sourcePosition }: NodeProps) => {
    return (
      <div className="grid h-4 w-4 place-items-center rounded-full border-2 border-blue-300 bg-blue-200">
        <Merge
          className={cn(
            "h-2 w-2 stroke-[3] text-blue-600",
            sourcePosition === "bottom" ? "rotate-180" : "rotate-90",
          )}
        />
        <InputHandle
          position={targetPosition}
          className={cn(
            "opacity-0",
            sourcePosition === "bottom" ? "left-2 top-3.5" : "left-3.5 top-2",
          )}
          // TODO: Validate if connection is a branch
          connectionCount={9999} // Set to a high number to allow multiple connections
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
        <OutputHandle
          id="branch-return"
          position={Position.Right}
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

MergeBranchesNode.displayName = "MergeBranchesNode";
