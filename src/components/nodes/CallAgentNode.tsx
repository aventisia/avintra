import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { cn } from "@aventisia/ui/lib";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";
import { BotIcon, GripVertical } from "lucide-react";
import { Separator } from "@aventisia/ui";
import { NodeDescription } from "../node-container/NodeDescription";
import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { NodeHeader } from "../node-container/node-header/NodeHeader";
import { memo } from "react";

type CallAgentNode = Node<NodeDataType, "callAgentNode">;

export const CallAgentNode = memo(
  ({
    data,
    selected,
    sourcePosition,
    targetPosition,
    id,
  }: NodeProps<CallAgentNode>) => {
    return (
      <>
        <div
          className={cn(
            "flex h-[5.3rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-[#3E37B3] bg-[#3E37B3] hover:ring hover:ring-ring",
            selected && "border-primary ring ring-ring",
            data?.isDisabled && "opacity-50",
            data?.isCut && "border-red-400 opacity-60",
          )}
        >
          <div
            className={cn(
              "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center bg-[#3E37B3]",
            )}
          >
            <GripVertical className={cn("h-5 w-5 text-white")} />
          </div>
          <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
            <div className="flex h-full w-full flex-col gap-2 bg-[#F9F9F9] px-4 pb-3.5 pt-[0.7rem]">
              <NodeHeader>
                {/* <div className="flex items-center gap-3"> */}
                <BotIcon className="h-5 w-5 text-[#3E37B3]" />
                <NodeHeading className="text-[#1E1B4B]">
                  {data.label}
                </NodeHeading>
              </NodeHeader>
              {/* </div> */}
              <Separator className="h-[1px] bg-[#E8E8E8]" />
              {/* Description */}
              <NodeDescription>{data.description}</NodeDescription>
              <InputHandle position={targetPosition} />
              <OutputHandle position={sourcePosition} />
            </div>
          </OpenNodeConfig>
        </div>
      </>
    );
  },
);

CallAgentNode.displayName = "CallAgentNode";
