import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { LoopNodeDataType } from "@/types/loop-node-data-type";
import { Node, NodeProps, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { memo } from "react";

type ForLoopNode = Node<LoopNodeDataType, "forLoopNode">;

export const ForLoopNode = memo(
  ({
    id,
    data,
    selected,
    sourcePosition,
    targetPosition,
  }: NodeProps<ForLoopNode>) => {
    return (
      <BaseNode selected={selected} nodeData={data} nodeId={id}>
        <InputHandle position={targetPosition} connectionCount={1} />
        <InputHandle
          id="for-loop-repeat"
          position={Position.Right}
          connectionCount={1}
          className="right-0 z-[5] h-[0.6rem] w-[0.6rem]"
        />
        <OutputHandle position={sourcePosition} connectionCount={2} />
      </BaseNode>
    );
  },
);

ForLoopNode.displayName = "ForLoopNode";
