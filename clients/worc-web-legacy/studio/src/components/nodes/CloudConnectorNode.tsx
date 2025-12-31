import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";

type CloudConnectorNode = Node<NodeDataType, "cloudConnectorNode">;

export const CloudConnectorNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
  id,
}: NodeProps<CloudConnectorNode>) => {
  return (
    <BaseNode selected={selected} nodeData={data} nodeId={id}>
      <InputHandle position={targetPosition} />
      <OutputHandle position={sourcePosition} />
    </BaseNode>
  );
};
