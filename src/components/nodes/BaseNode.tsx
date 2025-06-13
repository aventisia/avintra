import { iconMapper } from "@/components/icon-mapper";
import { NodeContainer } from "@/components/node-container";
import { NodeHeader } from "@/components/node-container/node-header/NodeHeader";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { NodeDescription } from "@/components/node-container/NodeDescription";
import { ReactFlowContextMenu } from "@/features/react-flow/components/context-menu";
import { NodeDataType } from "@/types/node-data-type";
import { Separator } from "@aventisia/ui";
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
  return (
    <ReactFlowContextMenu>
      <NodeContainer {...{ nodeId, nodeData, selected }} {...props}>
        <NodeHeader>
          {nodeData.icon ? (
            iconMapper[nodeData.icon]
          ) : (
            <NodeImage src={nodeData.img} />
          )}
          <NodeHeading>{nodeData.label}</NodeHeading>
        </NodeHeader>
        <Separator className="h-[0.5px] w-full bg-border" />
        <NodeDescription>{nodeData.description}</NodeDescription>
        {children}
      </NodeContainer>
    </ReactFlowContextMenu>
  );
};

export default BaseNode;
