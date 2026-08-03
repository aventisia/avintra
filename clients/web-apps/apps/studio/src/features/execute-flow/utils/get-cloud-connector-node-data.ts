import { Node } from "@xyflow/react";

import { NodeDataType, NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { CloudConnectorNodeData } from "..";

export function getCloudConnectorNodeData(
  nodeObj: Node<NodeDataType> | undefined,
  nextNodeId: string,
): CloudConnectorNodeData {
  return {
    id: nodeObj?.id ?? "",
    type: nodeObj?.type ?? "",
    nodeName: nodeObj?.data?.label ?? "",
    codeActivityName: nodeObj?.data?.name ?? "",
    nodeInputs:
      nodeObj?.data?.inputs?.map((input: NodeInputType) => ({
        key: input.key,
        value: input.value,
      })) ?? [],
    nodeOutputs:
      nodeObj?.data?.outputs?.map((output: NodeOutputType) => ({
        key: output.key,
        value: {
          value: String(output.value.value),
          enabled: output.value.enabled,
        },
      })) ?? [],
    nextNodeId: nextNodeId,
  };
}
