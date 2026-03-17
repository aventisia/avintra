import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";

import { cn } from "@aventisia/ui/lib";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BoxesIcon } from "lucide-react";
import { memo, useEffect } from "react";

import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";

type BlockNode = Node<NodeDataType, "blockNode">;

export const BlockNode = memo(
  ({
    data,
    selected,
    sourcePosition,
    targetPosition,
    id,
  }: NodeProps<BlockNode>) => {
    const { updateNodeData } = useReactFlow();

    useEffect(() => {
      if (data.type !== "blockNode") return;
      const isNewMod = ["Call Block"].includes(data.label);

      if (data?.selectedBlock || isNewMod) {
        const newLabel = data?.selectedBlock
          ? data?.selectedBlock?.name
          : "Call Block";
        if (newLabel) {
          //  node by id and update its label
          updateNodeData(id, {
            label: newLabel,
          });
        }
      }
    }, [data.label, data?.selectedBlock]);

    return (
      <>
        <div
          className={cn(
            "custom-drag-handle relative flex h-16 w-16 rounded-full border-2 border-[#1E1B4B] bg-[#1E1B4B] hover:ring hover:ring-ring",
            selected && "border-primary ring ring-ring",
            data?.isDisabled && "opacity-50",
            data?.isCut && "border-red-400 opacity-60",
          )}
        >
          <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
            <div className="flex h-full w-full items-center justify-center">
              {/* <NodeHeader> */}

              <BoxesIcon className="h-6 w-6 text-white" />
              <NodeHeading className="text-2xs">{data.label}</NodeHeading>
              <InputHandle position={targetPosition} />
              <OutputHandle position={sourcePosition} />
            </div>
          </OpenNodeConfig>
        </div>
      </>
    );
  },
);

BlockNode.displayName = "BlockNode";
