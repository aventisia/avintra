import {
  NodeDataType,
  NodeInputType,
  NodeOutputType,
} from "@/types/node-data-type";
import { Node } from "@xyflow/react";
import { ActivityNodeData } from "..";

export function getActivityNodeData(
  nodeObj: Node<NodeDataType> | undefined,
  nextNodeId: string,
): ActivityNodeData {
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
