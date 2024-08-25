import { CustomNodeType } from "@/types/custom-node-type";
import { Node } from "@xyflow/react";

export const createSupportNodeObj = (nodeType: CustomNodeType): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: nodeType,
    position: { x: 0, y: 0 },
    deletable: false,
    draggable: true,
    selectable: false,
  } as Node;
};
