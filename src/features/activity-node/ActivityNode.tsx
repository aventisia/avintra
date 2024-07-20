import { memo } from "react";
import { Node, NodeProps } from "@xyflow/react";
import { Separator } from "@/react-toolkit/components/ui";
import { ActivityNodeDataType } from "@/types";
import {
  NodeHeader,
  InputHandle,
  OutputHandle,
  NodeContainer,
  NodeDescription,
} from "@/components/ui";

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
        <OutputHandle />
      </NodeContainer>
    );
  },
);
