import { Node } from "@xyflow/react";

import { NodeDataType, NodeInputType } from "@/types/node-data-type";

import { ConditionType, ConditionalBranchNodeData } from "..";

export function getConditionalBranchNodeData(
  nodeObj: Node<NodeDataType> | undefined,
  conditionalNodeId: string,
  nextNodeId: string,
): ConditionalBranchNodeData {
  // Find the input with key "Conditions"
  const conditions = nodeObj?.data?.inputs?.find(
    (input: NodeInputType) => input.key === "Conditions",
  )?.value as ConditionType[][];

  return {
    id: nodeObj?.id ?? "",
    type: nodeObj?.type ?? "",
    nodeName: nodeObj?.data?.label ?? "",
    codeActivityName: nodeObj?.data?.name ?? "",
    conditions: conditions ?? [],
    conditionalNodeId,
    nextNodeId,
  };
}
