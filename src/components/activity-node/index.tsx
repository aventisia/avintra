import { InputHandle } from "@/components/InputHandle";
import { NodeContainer } from "@/components/NodeContainer";
import { NodeDescription } from "@/components/NodeDescription";
import { NodeHeader } from "@/components/NodeHeader";
import { OutputHandle } from "@/components/output-handle";
import { Separator } from "@/react-toolkit/ui/separator";
import { ActivityNodeDataType } from "@/types/activity-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { NodeCategory } from "../NodeCategory";
import { NodeHeading } from "../NodeHeading";
import { NodeIcon } from "../NodeIcon";

type ActivityNode = Node<ActivityNodeDataType, "activity">;

export const ActivityNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition
}: NodeProps<ActivityNode>) => {
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

      {/* Input (Target) Handle */}
      <InputHandle handlePosition={targetPosition} />

      {/* Output (Source) Handle */}
      <OutputHandle handlePosition={sourcePosition} />
    </NodeContainer>
  );
};
