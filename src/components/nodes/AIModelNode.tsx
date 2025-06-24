import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { ReactFlowContextMenu } from "@/features/react-flow/components/context-menu";
import { cn } from "@aventisia/ui/lib";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";
import { GripVertical, Wand2Icon } from "lucide-react";
import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { Separator } from "@aventisia/ui";
import { NodeDescription } from "../node-container/NodeDescription";

type AIModelNode = Node<NodeDataType, "aiNode">;

export const AIModelNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
  id,
}: NodeProps<AIModelNode>) => {
  return (
    <ReactFlowContextMenu>
      <div
        className={cn(
          "flex h-[5.3rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-indigo-300 hover:ring hover:ring-ring",
          data.color,
          selected && "border-primary ring ring-ring",
        )}
      >
        <div
          className={cn(
            "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center rounded-l-lg bg-indigo-700",
          )}
        >
          <GripVertical className={cn("h-5 w-5 text-slate-300")} />
        </div>
        <OpenNodeConfig {...{ nodeData: data, nodeId: id }}>
          <div
            className={cn(
              "flex h-full w-[18rem] flex-row items-center justify-around rounded-r-lg bg-gradient-to-br from-indigo-500 to-indigo-700 px-2",
            )}
          >
            <Wand2Icon className="text-white" />
            <div className="flex h-[5.3] flex-col justify-around">
              <NodeHeading className={"text-lg text-white"}>
                {data.label}
              </NodeHeading>
              <Separator className="my-2 h-[0.5px] w-full bg-border" />
              <NodeDescription className={"text-white"}>
                {data.description}
              </NodeDescription>
            </div>
          </div>
        </OpenNodeConfig>
      </div>
      <InputHandle position={targetPosition} />
      <OutputHandle position={sourcePosition} />
    </ReactFlowContextMenu>
  );
};
