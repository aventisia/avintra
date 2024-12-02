import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { ActivityNodeDataType } from "@/types/activity-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";

type ActivityNode = Node<ActivityNodeDataType, "activityNode">;

export const ActivityNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
  id,
}: NodeProps<ActivityNode>) => {
  return (
    <BaseNode id={id} selected={selected} data={data}>
      <InputHandle position={targetPosition} />
      <OutputHandle position={sourcePosition} />
    </BaseNode>
  );
};
