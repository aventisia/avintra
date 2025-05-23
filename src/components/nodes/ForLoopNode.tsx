import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";

type ForLoopNode = Node<NodeDataType, "forLoopNode">;

export const ForLoopNode = ({
  id,
  data,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps<ForLoopNode>) => {
  return (
    <BaseNode selected={selected} nodeData={data} nodeId={id}>
      <InputHandle position={targetPosition} connectionCount={2} />
      <InputHandle
        id="for-loop-repeat"
        position={Position.Right}
        connectionCount={2}
      />
      <OutputHandle position={sourcePosition} connectionCount={2} />
    </BaseNode>
  );
};
