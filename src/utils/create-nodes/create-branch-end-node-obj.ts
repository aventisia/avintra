import { Node } from "@xyflow/react";

export const createBranchEndNodeObj = (
  groupType: "CondtionalBranch" | "LoopBranch",
  customParentId: string,
  parentId?: string,
): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: "branchEndNode",
    data: { groupType, customParentId },
    position: { x: 0, y: 0 },
    deletable: false,
    draggable: true,
    selectable: false,
    parentId,
  } as Node;
};
