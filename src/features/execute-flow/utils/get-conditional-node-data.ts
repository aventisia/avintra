import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { NodeInputType } from "@/types/node-data-type";
import { Node } from "@xyflow/react";
import { ConditionalNodeData } from "..";

export function getConditionNodeData(
  nodeObj: Node<ConditionalNodeDataType> | undefined,
): ConditionalNodeData {
  // Find the input with key "ConditionalMode"
  const conditionalModeInput = nodeObj?.data?.inputs?.find(
    (input: NodeInputType) => input.key === "ConditionalMode",
  );

  return {
    id: nodeObj?.id ?? "",
    conditionalMode:
      conditionalModeInput?.value === "SwitchCase" ||
      conditionalModeInput?.value === "NestedIfElse"
        ? conditionalModeInput.value
        : "SwitchCase",
    branches: nodeObj?.data?.branches ?? [],
    mergeBranchesNodeId: nodeObj?.data?.mergeBranchesNodeId ?? "",
  };
}
