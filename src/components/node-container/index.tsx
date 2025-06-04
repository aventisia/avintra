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
        "flex h-[5.3rem] w-[19.5rem] rounded-lg border-2 border-slate-300 hover:ring hover:ring-ring",
        className,
        nodeData.type == "forLoopNode" && "border-purple-300",
        nodeData.type == "conditionalNode" && "border-orange-300",
        selected && "border-primary ring ring-ring",
      )}
      {...props}
    >
      <div className="custom-drag-handle flex h-full w-5 cursor-grab items-center justify-center rounded-l-lg bg-slate-100">
        <GripVertical className="h-5 w-5 text-slate-300" />
      </div>
      <OpenNodeConfig {...{ nodeData, nodeId }}>
        <div
          className={cn(
            "flex w-[18rem] grow flex-col gap-2 rounded-r-lg bg-white px-4 pb-3.5 pt-[0.7rem]",
            nodeData.type == "forLoopNode" && "bg-purple-100",
            nodeData.type == "conditionalNode" && "bg-orange-50",
          )}
        >
          {children}
        </div>
      </OpenNodeConfig>
    </div>
  );
};
