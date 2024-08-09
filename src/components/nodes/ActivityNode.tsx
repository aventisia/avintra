import { Separator } from "@/react-toolkit/ui/separator";
import { ActivityNodeDataType } from "@/types/activity-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { InputHandle } from "../handles/InputHandle";
import { OutputHandle } from "../handles/OutputHandle";
import { NodeContainer } from "../node-container";
import { NodeCategory } from "../node-container/node-header/NodeCategory";
import { NodeHeader } from "../node-container/node-header/NodeHeader";
import { NodeHeading } from "../node-container/node-header/NodeHeading";
import { NodeIcon } from "../node-container/node-header/NodeIcon";
import { NodeDescription } from "../node-container/NodeDescription";

type ActivityNode = Node<ActivityNodeDataType, "activity">;

export const ActivityNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
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
      <InputHandle position={targetPosition} />

      {/* Output (Source) Handle */}
      <OutputHandle position={sourcePosition} />
    </NodeContainer>
  );
};
