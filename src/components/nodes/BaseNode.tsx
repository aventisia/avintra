import { NodeContainer } from "@/components/node-container";
import { NodeCategory } from "@/components/node-container/node-header/NodeCategory";
import { NodeHeader } from "@/components/node-container/node-header/NodeHeader";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { NodeDescription } from "@/components/node-container/NodeDescription";
import { iconMapper } from "@/components/icon-mapper";
import { Separator } from "@/react-toolkit/ui/separator";
import { NodeDataType } from "@/types/node-data-type";
import React from "react";

interface BaseNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  data: NodeDataType;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  selected,
  data,
  children,
  ...props
}) => {
  return (
    <NodeContainer selected={selected} {...props}>
      <NodeHeader>
        {data.icon ? iconMapper[data.icon] : <NodeImage src={data.img} />}
        <NodeHeading>{data.label}</NodeHeading>
        <NodeCategory>{data.name}</NodeCategory>
      </NodeHeader>
      <Separator className="h-[0.5px] w-full bg-border" />
      <NodeDescription>{data.description}</NodeDescription>
      {children}
    </NodeContainer>
  );
};

export default BaseNode;
