import { Node } from "@xyflow/react";

export const createConditionalBranchNodeObj = (
  label: string,
  isDefaultBranch: boolean = false,
  mergeBranchesNodeId: string,
): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: "branchNode1",
    data: {
      type: "branchNode1",
      name: isDefaultBranch ? "DefaultBranch" : "ConditionalBranchActivity",
      label: label,
      description: "Add one or more conditions",
      mergeBranchesNodeId: mergeBranchesNodeId,
    },
    position: { x: 0, y: 0 },
    deletable: isDefaultBranch ? false : true,
    draggable: true,
    selectable: true,
  } as Node;
};
