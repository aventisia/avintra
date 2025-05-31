import { Node } from "@xyflow/react";

export const createConditionalBranchNodeObj = (
  label: string,
  isDefaultBranch: boolean = false,
): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: "branchNode1",
    data: {
      type: "branchNode1",
      name: label,
      label: label,
      description: label,
    },
    position: { x: 0, y: 0 },
    deletable: isDefaultBranch ? false : true,
    draggable: true,
    selectable: true,
  } as Node;
};
