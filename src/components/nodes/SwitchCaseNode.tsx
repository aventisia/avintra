import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { SwitchCaseNodeDataType } from "@/types/switch-case-node-data-type";
import { Node, NodeProps, NodeToolbar, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { PlusIcon } from "@heroicons/react/24/outline";
import { cn } from "@aventisia/ui/lib";
import { Button } from "@aventisia/ui/buttons";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { useAddSwitchCaseBranch } from "@/hooks/useAddSwitchCaseBranch";

type SwitchCaseNode = Node<SwitchCaseNodeDataType, "switchCaseNode">;

export const SwitchCaseNode = ({
  id,
  data,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps<SwitchCaseNode>) => {
  // Get add switch case branch hook
  const addSwitchCaseBranch = useAddSwitchCaseBranch();

  return (
    <>
      <BaseNode selected={selected} data={data}>
        <InputHandle position={targetPosition} />
        <OutputHandle position={sourcePosition} connectionCount={2} />
      </BaseNode>
      <NodeToolbar offset={5} position={Position.Bottom}>
        <Button
          className={cn(
            buttonVariants({ variant: "outline", size: "icon5" }),
            "group z-10 rounded-full opacity-50",
            "hover:bg-primary hover:opacity-100",
            "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
            "nodrag nopan",
          )}
          onClick={() => addSwitchCaseBranch(data,id)}
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
    </>
  );
};
