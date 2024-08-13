import { cn } from "@/react-toolkit/lib/utils";
import { Separator } from "@/react-toolkit/ui/separator";
import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { OutputHandle } from "../../handles/OutputHandle";
import { NodeContainer } from "../../node-container";
import { NodeCategory } from "../../node-container/node-header/NodeCategory";
import { NodeHeader } from "../../node-container/node-header/NodeHeader";
import { NodeHeading } from "../../node-container/node-header/NodeHeading";
import { NodeIcon } from "../../node-container/node-header/NodeIcon";
import { NodeDescription } from "../../node-container/NodeDescription";
import { NodeSelector } from "../../node-selector";
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
      className={cn("border-green-600", selected && "border-slate-300")}
      selected={selected}
    >
      {/* Node Header */}
      <NodeHeader>
        <NodeIcon src={data.icon} />
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
