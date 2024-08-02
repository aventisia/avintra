import { NodeContainer } from "@/components/NodeContainer";
import { NodeDescription } from "@/components/NodeDescription";
import { NodeHeader } from "@/components/NodeHeader";
import { OutputHandle } from "@/components/output-handle";
import { Separator } from "@/react-toolkit/ui/separator";
import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Node, NodeProps } from "@xyflow/react";

type TriggerNode = Node<TriggerNodeDataType, "trigger">;

export const TriggerNode = ({
  data,
  selected,
  dragging,
}: NodeProps<TriggerNode>) => {
  return (
    // Node Container
    <NodeContainer selected={selected}>
      {/* Node label */}
      <NodeHeader
        iconSrc={data.icon}
        label={data.label}
        category={data.category}
      />

      {/* Separator */}
      <Separator className="h-[0.5px] w-full bg-border" />

      {/* Node description */}
      <NodeDescription>{data.description}</NodeDescription>

      {/* Output (Source) Handle */}
      <OutputHandle
        selected={selected}
        dragging={dragging}
        handlePosition={data.sourcePosition}
      />
    </NodeContainer>
  );
};
