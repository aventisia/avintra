import { NodeContainer } from "@/components/NodeContainer";
import { NodeDescription } from "@/components/NodeDescription";
import { NodeHeader } from "@/components/NodeHeader";
import { OutputHandle } from "@/components/output-handle";
import { Separator } from "@/react-toolkit/ui/separator";
import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { NodeCategory } from "../NodeCategory";
import { NodeHeading } from "../NodeHeading";
import { NodeIcon } from "../NodeIcon";
import { ReplaceFlowTrigger } from "./ReplaceFlowTrigger";

type TriggerNode = Node<TriggerNodeDataType, "trigger">;

export const TriggerNode = ({ data, selected }: NodeProps<TriggerNode>) => {
  return (
    // Node Container
    <NodeContainer selected={selected}>
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
      <ReplaceFlowTrigger />

      {/* Output (Source) Handle */}
      <OutputHandle handlePosition={data.sourcePosition} />
    </NodeContainer>
  );
};
