import { NodeContainer } from "@/components/node-container";
import { NodeCategory } from "@/components/node-container/node-header/NodeCategory";
import { NodeHeader } from "@/components/node-container/node-header/NodeHeader";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { NodeDescription } from "@/components/node-container/NodeDescription";
import { nodesIconMapper } from "@/components/node-icons/NodesIconMapper";
import { Separator } from "@/react-toolkit/ui/separator";
import { NodeDataType } from '@/types/node-data-type';
import React from 'react';

interface BaseNodeProps {
  selected?: boolean;
  data: NodeDataType;
  children?: React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({ selected, data, children }) => {
  return (
    <NodeContainer selected={selected}>
      <NodeHeader>
        {data.icon ? nodesIconMapper[data.icon] : <NodeImage src={data.img} />}
        <NodeHeading>{data.label}</NodeHeading>
        <NodeCategory>{data.category}</NodeCategory>
      </NodeHeader>
      <Separator className="h-[0.5px] w-full bg-border" />
      <NodeDescription>{data.description}</NodeDescription>
      {children}
    </NodeContainer>
  );
};

export default BaseNode;