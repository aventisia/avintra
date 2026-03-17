import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { cn } from "@aventisia/ui/lib";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

type TriggerNode = Node<NodeDataType, "triggerNode">;

export const TriggerNode = memo(
  ({ selected, sourcePosition }: NodeProps<TriggerNode>) => {
    return (
      <div
        className={cn(
          "flex h-9 w-16 items-center justify-center gap-2 rounded-full bg-[--flow-start] text-2xs",
          selected && "border-primary ring ring-ring",
        )}
      >
        <span>Start</span>
        <OutputHandle position={sourcePosition} />
      </div>
    );
  },
);

TriggerNode.displayName = "TriggerNode";
