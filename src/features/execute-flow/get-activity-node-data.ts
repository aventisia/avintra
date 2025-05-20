import { ActivityNodeDataType } from "@/types/activity-node-data-type";
import { NodeData } from "./node-data";
import { Node } from "@xyflow/react";
import { NodeDataInputsOutputs } from "@/types/node-data-type";

export function getActivityNodeData(
  nodeObj: Node<ActivityNodeDataType> | undefined,
): NodeData {
  return {
    id: nodeObj?.id ?? "",
    type: "activityNode",
    nodeName: nodeObj?.data?.label ?? "",
    codeActivityName: nodeObj?.data?.name ?? "",
    nodeInputs:
      nodeObj?.data?.inputs?.map((input: NodeDataInputsOutputs) => ({
        key: input.key,
        value: String(input.value),
      })) ?? [],
    nodeOutputs:
      nodeObj?.data?.outputs?.map((output: NodeDataInputsOutputs) => ({
        key: output.key,
        value: String(output.value),
      })) ?? [],
  };
}
