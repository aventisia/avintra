import { iconMapper } from "@/components/icon-mapper";
import { NodeContainer } from "@/components/node-container";
import { NodeHeader } from "@/components/node-container/node-header/NodeHeader";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { NodeDescription } from "@/components/node-container/NodeDescription";
import { ReactFlowContextMenu } from "@/features/react-flow/components/context-menu";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
import { NodeDataType } from "@/types/node-data-type";
import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import React from "react";

interface BaseNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  nodeData: NodeDataType;
  nodeId: string;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  selected,
  nodeData,
  children,
  nodeId,
  ...props
}) => {
  const { toggleGroupExpand } = useGroupToggle();

  const renderCount = nodeData?.count
    ? nodeData?.count === 2
      ? 1
      : nodeData?.count === 3
        ? 2
        : nodeData?.count >= 4
          ? 3
          : 0
    : 0;

  return (
    <ReactFlowContextMenu>
      <div className={nodeData?.isGroupHead ? "relative" : ""}>
        {nodeData?.isGroupHead &&
          !nodeData?.isExpanded &&
          Array.from({ length: renderCount }).map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 left-${renderCount - i} top-${renderCount - i} -z-10 h-[5.3rem] w-[19.5rem] overflow-clip rounded-lg border-2 border-slate-400 bg-white hover:ring hover:ring-ring ${nodeData?.isDisabled && "opacity-50"} `}
            />
          ))}
        <NodeContainer {...{ nodeId, nodeData, selected }} {...props}>
          <NodeHeader>
            {nodeData.icon ? (
              iconMapper[nodeData.icon]
            ) : (
              <NodeImage src={nodeData.img} />
            )}
            <NodeHeading>{nodeData.label}</NodeHeading>
            {nodeData?.isGroupHead && (
              <Button
                variant={"ghost"}
                size={"icon6"}
                onClick={() => toggleGroupExpand(nodeData?.groupId || "")}
              >
                {nodeData?.isExpanded ? (
                  <>
                    <ChevronUpIcon />
                  </>
                ) : (
                  <>
                    <ChevronDownIcon />
                  </>
                )}
              </Button>
            )}{" "}
          </NodeHeader>
          <Separator
            className={cn(
              "h-[1px] w-full bg-border",
              nodeData.type == "forLoopNode" && "bg-[#D1CFF8]",
              nodeData.type == "conditionalNode" && "bg-[#D1CFF8]",
              nodeData.type == "blockNode" && "bg-[#E8E8E8]",
            )}
          />
          <NodeDescription>{nodeData.description}</NodeDescription>
          {children}
        </NodeContainer>
      </div>
    </ReactFlowContextMenu>
  );
};

export default BaseNode;
