import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";

import BaseNode from "./BaseNode";

type IfElseNode = Node<NodeDataType, "ifElseNode">;

export const IfElseNode = memo(
  ({ id, data, selected, sourcePosition, targetPosition }: NodeProps<IfElseNode>) => {
    return (
      <BaseNode selected={selected} nodeData={data} nodeId={id}>
        <InputHandle position={targetPosition} />
        <OutputHandle position={sourcePosition} connectionCount={2} />
      </BaseNode>
    );
  },
);

IfElseNode.displayName = "IfElseNode";
