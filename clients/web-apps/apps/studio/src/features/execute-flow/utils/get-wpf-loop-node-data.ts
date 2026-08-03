import { Node } from "@xyflow/react";

import { LoopNodeDataType } from "@/types/loop-node-data-type";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { ConditionType, WpfLoopNodeData } from "..";

export function getWpfLoopNodeData(
  nodeObj: Node<LoopNodeDataType> | undefined,
  nextNodeId: string,
): WpfLoopNodeData {
  // Find the input with key "Conditions"
  const conditions = nodeObj?.data?.inputs?.find(
    (input: NodeInputType) => input.key === "Conditions",
  )?.value as ConditionType[][];

  // Find the input with key "LoopType"
  const loopType = nodeObj?.data?.inputs?.find((input: NodeInputType) => input.key === "LoopType")
    ?.value as "ConditionalLoop" | "ForEachLoop";

  // Find the input with key "ListVariableName"
  const listVariableName = nodeObj?.data?.inputs?.find(
    (input: NodeInputType) => input.key === "ListVariableName",
  )?.value as string;

  // Find the input with key "ItemVariableName"
  const itemVariableName = nodeObj?.data?.outputs?.find(
    (output: NodeOutputType) => output.key === "ItemVariableName",
  )?.value.value as string;

  // Find the input with key "ItemIndexVariableName"
  const itemIndexVariableName = nodeObj?.data?.outputs?.find(
    (output: NodeOutputType) => output.key === "ItemIndexVariableName",
  )?.value.value as string;

  return {
    id: nodeObj?.id ?? "",
    type: nodeObj?.type ?? "",
    nodeName: nodeObj?.data?.label ?? "",
    loopType,
    mergeBranchesNodeId: nodeObj?.data?.mergeBranchesNodeId ?? "",
    conditions: conditions ?? [],
    listVariableName: listVariableName ?? "",
    itemVariableName: itemVariableName ?? "",
    itemIndexVariableName: itemIndexVariableName ?? "",
    nextNodeId: nextNodeId,
  };
}
