import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { ReactFlowContextMenu } from "@/features/react-flow/components/context-menu";
import { cn } from "@aventisia/ui/lib";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";
import { Bot, GripVertical } from "lucide-react";
import { Separator } from "@aventisia/ui";
import { NodeDescription } from "../node-container/NodeDescription";
import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { NodeHeader } from "../node-container/node-header/NodeHeader";

type CallAgentNode = Node<NodeDataType, "callAgentNode">;

export const CallAgentNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
  id,
}: NodeProps<CallAgentNode>) => {
  return (
    <ReactFlowContextMenu>
      <div
        className={cn(
          "flex h-[5.3rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-[#1E1B4B] hover:ring hover:ring-ring",
          selected && "border-primary ring ring-ring",
          data?.isDisabled && "opacity-50",
        )}
      >
        <div
          className={cn(
            "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center rounded-l-lg bg-[#1E1B4B]",
          )}
        >
          <GripVertical className={cn("h-5 w-5 text-white")} />
        </div>
        <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
          <div className="flex w-[18rem] grow flex-col gap-2 rounded-r-lg bg-[#F9F9F9] px-4 pb-3.5 pt-[0.7rem]">
            <NodeHeader>
              {/* <div className="flex items-center gap-3"> */}
              <Bot className="h-5 w-5" />
              <NodeHeading> {data.label}</NodeHeading>
            </NodeHeader>
            {/* </div> */}
            <Separator className="h-[1px] bg-[#E8E8E8]" />
            {/* Description */}
            <NodeDescription>{data.description}</NodeDescription>
          </div>
        </OpenNodeConfig>
      </div>
      <InputHandle position={targetPosition} />
      <OutputHandle position={sourcePosition} />
    </ReactFlowContextMenu>
  );
};
