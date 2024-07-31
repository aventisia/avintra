import { InputHandle } from "@/components/ui/InputHandle";
import { NodeContainer } from "@/components/ui/NodeContainer";
import { NodeDescription } from "@/components/ui/NodeDescription";
import { NodeHeader } from "@/components/ui/NodeHeader";
import { OutputHandle } from "@/components/ui/output-handle/OutputHandle";
import { Separator } from "@/react-toolkit/ui/separator";
import { ActivityNodeDataType } from "@/types/ActivityNodeDataType";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

type ActivityNode = Node<ActivityNodeDataType, "activity">;

export const ActivityNode = memo(
  ({ data, selected }: NodeProps<ActivityNode>) => {
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
        <OutputHandle selected={selected} />
      </NodeContainer>
    );
  },
);
