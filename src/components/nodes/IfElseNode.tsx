import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeContainer } from "@/components/node-container";
import { NodeCategory } from "@/components/node-container/node-header/NodeCategory";
import { NodeHeader } from "@/components/node-container/node-header/NodeHeader";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { NodeDescription } from "@/components/node-container/NodeDescription";
import { nodesIconMapper } from "@/components/node-icons/NodesIconMapper";
import { Separator } from "@/react-toolkit/ui/separator";
import { IfElseNodeDataType } from "@/types/if-else-node-data-type";
import { Node, NodeProps } from "@xyflow/react";

type IfElseNode = Node<IfElseNodeDataType, "ifElseNode">;

export const IfElseNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps<IfElseNode>) => {
  return (
    // Node Container
    <NodeContainer selected={selected}>
      {/* Node Header */}
      <NodeHeader>
        {data.icon ? nodesIconMapper[data.icon] : <NodeImage src={data.img} />}
        <NodeHeading>{data.label}</NodeHeading>
        <NodeCategory>{data.category}</NodeCategory>
      </NodeHeader>

      {/* Separator */}
      <Separator className="h-[0.5px] w-full bg-border" />

      {/* Node description */}
      <NodeDescription>{data.description}</NodeDescription>

      {/* Input (Target) Handle */}
      <InputHandle position={targetPosition} />

      {/* Output (Source) Handle */}
      <OutputHandle position={sourcePosition} />
    </NodeContainer>
  );
};
