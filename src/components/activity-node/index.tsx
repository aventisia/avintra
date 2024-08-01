import { InputHandle } from "@/components/InputHandle";
import { NodeContainer } from "@/components/NodeContainer";
import { NodeDescription } from "@/components/NodeDescription";
import { NodeHeader } from "@/components/NodeHeader";
import { OutputHandle } from "@/components/output-handle";
import { Separator } from "@/react-toolkit/ui/separator";
import { ActivityNodeDataType } from "@/types/ActivityNodeDataType";
import { Node, NodeProps } from "@xyflow/react";

type ActivityNode = Node<ActivityNodeDataType, "activity">;

export const ActivityNode = ({
  data,
  selected,
  dragging,
}: NodeProps<ActivityNode>) => {
  return (
    // Node Container
    <NodeContainer selected={selected}>
      {/* Node label */}
      <NodeHeader iconSrc={data.icon} label={data.label} />

      {/* Separator */}
      <Separator className="h-[0.5px] w-full bg-border" />

      {/* Node description */}
      <NodeDescription description={data.description} />

      {/* Input (Target) Handle */}
      <InputHandle />

      {/* Output (Source) Handle */}
      <OutputHandle
        selected={selected}
        dragging={dragging}
        handlePosition={data.sourcePosition}
      />
    </NodeContainer>
  );
};
