import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeContainer } from "@/components/node-container";
import { NodeCategory } from "@/components/node-container/node-header/NodeCategory";
import { NodeHeader } from "@/components/node-container/node-header/NodeHeader";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { NodeDescription } from "@/components/node-container/NodeDescription";
import { nodesIconMapper } from "@/components/node-icons/NodesIconMapper";
import { NodeSelector } from "@/components/node-selector";
import { cn } from "@/react-toolkit/lib/utils";
import { Separator } from "@/react-toolkit/ui/separator";
import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { ReplaceFlowTrigger } from "./ReplaceFlowTrigger";

type TriggerNode = Node<TriggerNodeDataType, "triggerNode">;

export const TriggerNode = ({
  data,
  selected,
  sourcePosition,
}: NodeProps<TriggerNode>) => {
  return (
    // Node Container
    <NodeContainer
      className={cn("border-green-600 ring-1 ring-green-600")}
      selected={selected}
    >
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

      {/* Node selector to replace flow trigger */}
      <NodeSelector
        origin="ReplaceTrigger"
        originId="NA"
        sideOffset={10}
        alignOffset={-12}
      >
        <ReplaceFlowTrigger />
      </NodeSelector>

      {/* Output (Source) Handle */}
      <OutputHandle position={sourcePosition} />
    </NodeContainer>
  );
};
