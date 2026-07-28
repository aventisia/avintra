import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import BaseNode from "./BaseNode";

type ContinueLoopNode = Node<NodeDataType, "continueLoopNode">;

export const ContinueLoopNode = memo(
  ({ data, selected, sourcePosition, targetPosition, id }: NodeProps<ContinueLoopNode>) => {
    return (
      <BaseNode selected={selected} nodeData={data} nodeId={id}>
        <InputHandle position={targetPosition} />
        <OutputHandle position={sourcePosition} />
      </BaseNode>
    );
  },
);

ContinueLoopNode.displayName = "ContinueLoopNode";
