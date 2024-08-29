import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { IfElseNodeDataType } from "@/types/if-else-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";

type IfElseNode = Node<IfElseNodeDataType, "ifElseNode">;

export const IfElseNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps<IfElseNode>) => {
  return (
    <BaseNode selected={selected} data={data}>
      <InputHandle position={targetPosition} />
      <OutputHandle position={sourcePosition} connectionCount={2} />
    </BaseNode>
  );
};
