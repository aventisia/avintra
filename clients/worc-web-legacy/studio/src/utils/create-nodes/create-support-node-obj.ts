import { SupportNodeType } from "@/types/support-node-type";
import { Node } from "@xyflow/react";

/**
 * Creates a support node object.
 *
 * @param nodeType - The type of the support node.
 * @returns A new support node object.
 */
export const createSupportNodeObj = (nodeType: SupportNodeType, parentId?:string): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: nodeType,
    position: { x: 0, y: 0 },
    deletable: false,
    draggable: true,
    selectable: false,
    parentId
  } as Node;
};
