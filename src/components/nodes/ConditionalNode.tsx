import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { Node, NodeProps, NodeToolbar, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { PlusIcon } from "@heroicons/react/24/outline";
import { cn } from "@aventisia/ui/lib";
import { Button } from "@aventisia/ui/buttons";
import { buttonVariants } from "@aventisia/ui/buttons";
import { useAddConditionalBranch } from "@/hooks/useAddConditionalBranch";
import { memo } from "react";

type ConditionalNode = Node<ConditionalNodeDataType, "conditionalNode">;

export const ConditionalNode = memo(
  ({
    id,
    data,
    selected,
    sourcePosition,
    targetPosition,
  }: NodeProps<ConditionalNode>) => {
    // Get add switch case branch hook
    const addConditionalBranch = useAddConditionalBranch();

    const showPlusIcon = data?.isGroupHead && !data?.isExpanded;

    return (
      <>
        <BaseNode selected={selected} nodeData={data} nodeId={id}>
          <InputHandle position={targetPosition} />
          <OutputHandle position={sourcePosition} connectionCount={2} />
        </BaseNode>
        {showPlusIcon ? null : (
          <NodeToolbar offset={5} position={Position.Bottom}>
            <Button
              className={cn(
                buttonVariants({ variant: "outline", size: "icon5" }),
                "group z-10 rounded-full opacity-50",
                "hover:bg-primary hover:opacity-100",
                "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
                "nodrag nopan",
              )}
              onClick={() => addConditionalBranch(data, id)}
            >
              <PlusIcon
                className={cn(
                  "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
                  "group-hover:text-white group-hover:opacity-100",
                  "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
                )}
              />
            </Button>
          </NodeToolbar>
        )}{" "}
      </>
    );
  },
);

ConditionalNode.displayName = "ConditionalNode";
