import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import { InputHandle } from "@/components/handles/InputHandle";
import { NodeDataType } from "@/types/node-data-type";

import BaseNode from "./BaseNode";

type FlowExitNode = Node<NodeDataType, "flowExitNode">;

export const FlowExitNode = memo(
  ({ data, selected, targetPosition, id }: NodeProps<FlowExitNode>) => {
    return (
      <BaseNode selected={selected} nodeData={data} nodeId={id}>
        <InputHandle position={targetPosition} />
      </BaseNode>
    );
  },
);

FlowExitNode.displayName = "FlowExitNode";
