import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import BaseNode from "./BaseNode";

type BreakLoopNode = Node<NodeDataType, "breakLoopNode">;

export const BreakLoopNode = memo(
  ({ data, selected, sourcePosition, targetPosition, id }: NodeProps<BreakLoopNode>) => {
    return (
      <BaseNode selected={selected} nodeData={data} nodeId={id}>
        <InputHandle position={targetPosition} />
        <OutputHandle position={sourcePosition} />
      </BaseNode>
    );
  },
);

BreakLoopNode.displayName = "BreakLoopNode";
