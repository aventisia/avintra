import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { memo } from "react";

type CloudConnectorNode = Node<NodeDataType, "cloudConnectorNode">;

export const CloudConnectorNode = memo(
  ({
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
  },
);

CloudConnectorNode.displayName = "CloudConnectorNode";
