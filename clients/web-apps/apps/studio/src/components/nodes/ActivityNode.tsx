import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";

import BaseNode from "./BaseNode";

type ActivityNode = Node<NodeDataType, "activityNode">;

export const ActivityNode = memo(
  ({ data, selected, sourcePosition, targetPosition, id }: NodeProps<ActivityNode>) => {
    return (
      <BaseNode selected={selected} nodeData={data} nodeId={id}>
        <InputHandle position={targetPosition} />
        <OutputHandle position={sourcePosition} />
      </BaseNode>
    );
  },
);

ActivityNode.displayName = "ActivityNode";
