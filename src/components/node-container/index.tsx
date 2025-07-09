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
        nodeData.type == "forLoopNode" && "border-blue-500",
        nodeData.type == "conditionalNode" && "border-violet-400",
        nodeData.type == "blockNode" && "border-purple-300",
        className,
        selected && "border-primary ring ring-ring",
        nodeData?.isDisabled && "opacity-50",
      )}
      {...props}
    >
      <div
        className={cn(
          "custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center rounded-l-lg bg-slate-100",
          nodeData.type == "forLoopNode" && "bg-blue-100",
          nodeData.type == "conditionalNode" && "bg-violet-200",
          nodeData.type == "blockNode" && "bg-purple-200",
        )}
      >
        <GripVertical className={cn("h-5 w-5 text-slate-50")} />
      </div>
      <OpenNodeConfig {...{ nodeData, nodeId }}>
        <div
          className={cn(
            "flex w-[18rem] grow flex-col gap-2 rounded-r-lg bg-white px-4 pb-3.5 pt-[0.7rem]",
            nodeData.type == "forLoopNode" && "bg-blue-50",
            nodeData.type == "conditionalNode" && "bg-violet-100",
            nodeData.type == "blockNode" && "bg-purple-100",
          )}
        >
          {children}
        </div>
      </OpenNodeConfig>
    </div>
  );
};
