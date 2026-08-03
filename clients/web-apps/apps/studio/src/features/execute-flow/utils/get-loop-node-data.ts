import { Node } from "@xyflow/react";

import { LoopNodeDataType } from "@/types/loop-node-data-type";
import { NodeInputType } from "@/types/node-data-type";

import { LoopNodeData } from "..";

export function getLoopNodeData(nodeObj: Node<LoopNodeDataType> | undefined): LoopNodeData {
  // Find the input with key "LoopType"
  const loopTypeInput = nodeObj?.data?.inputs?.find(
    (input: NodeInputType) => input.key === "LoopType",
  );

  return {
    id: nodeObj?.id ?? "",
    loopType:
      loopTypeInput?.value === "ConditionalLoop" || loopTypeInput?.value === "ForEachLoop"
        ? loopTypeInput.value
        : "ConditionalLoop",
    mergeBranchesNodeId: nodeObj?.data?.mergeBranchesNodeId ?? "",
    controlAction: undefined,
  };
}
