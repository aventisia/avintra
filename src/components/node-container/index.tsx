import { cn } from "@aventisia/ui/lib";
import { GripVertical } from "lucide-react";
import { OpenNodeConfig } from "./node-header/OpenNodeConfig";
import { NodeDataType } from "@/types/node-data-type";

interface NodeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  nodeId: string;
  nodeData: NodeDataType;
  selected?: boolean;
}

export const NodeContainer = ({
  nodeId,
  nodeData,
  selected = false,
  className,
  children,
  ...props
}: NodeContainerProps) => {
  return (
    <div
      className={cn(
        "flex h-[5.3rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-slate-300 hover:ring hover:ring-ring",
        nodeData.type == "forLoopNode" && "border-[#B5B1F4] bg-[#B5B1F4]",
        nodeData.type == "conditionalNode" && "border-[#7D76EC] bg-[#7D76EC]",
        nodeData.type == "blockNode" && "border-[#1E1B4B] bg-[#F9F9F9]",
        !!nodeData?.groupId && "border-slate-500",
        className,
        selected && "border-primary ring ring-ring",
        nodeData?.isDisabled && "opacity-50",
        nodeData?.isCut && "border-red-400 opacity-60",
      )}
      {...props}
    >
      <div
        className={cn(
          "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center bg-slate-200",
          nodeData.type == "forLoopNode" && "bg-[#7D76EC]",
          nodeData.type == "conditionalNode" && "bg-[#6159E8]",
          nodeData.type == "blockNode" && "bg-[#1E1B4B]",
          !!nodeData?.groupId && "bg-slate-300",
        )}
      >
        <GripVertical className={cn("h-5 w-5 text-white")} />
      </div>
      <OpenNodeConfig {...{ nodeData, nodeId }}>
        <div
          className={cn(
            "flex h-full w-full flex-col gap-2 bg-white px-4 pb-3.5 pt-[0.7rem]",
            nodeData.type == "forLoopNode" && "bg-[#EDEDFC]",
            nodeData.type == "conditionalNode" && "bg-[#EDEDFC]",
            nodeData.type == "blockNode" && "bg-[#F9F9F9]",
          )}
        >
          {children}
        </div>
      </OpenNodeConfig>
    </div>
  );
};
