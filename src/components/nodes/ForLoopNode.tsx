import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { LoopNodeDataType } from "@/types/loop-node-data-type";
import { Node, NodeProps, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";

type ForLoopNode = Node<LoopNodeDataType, "forLoopNode">;

export const ForLoopNode = ({
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
        className="right-1/2"
      />
      <OutputHandle position={sourcePosition} connectionCount={2} />
    </BaseNode>
  );
};
