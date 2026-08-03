import { Node } from "@xyflow/react";

import { NODE_HEIGHT, NODE_WIDTH } from "@/constants";
import { SupportNodeType } from "@/types/support-node-type";

/**
 * Creates a support node object.
 *
 * @param nodeType - The type of the support node.
 * @returns A new support node object.
 */
export const createSupportNodeObj = (
  nodeType: SupportNodeType,
  parentId?: string,
  hidden: boolean = false,
): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: nodeType,
    position:
      nodeType == "modelNode"
        ? {
            x: NODE_WIDTH,
            y: 1.75 * NODE_HEIGHT,
          }
        : { x: 0, y: 0 },
    deletable: false,
    draggable: true,
    className: nodeType == "modelNode" ? "nodrag" : "",
    selectable: false,
    parentId,
    hidden,
  } as Node;
};
