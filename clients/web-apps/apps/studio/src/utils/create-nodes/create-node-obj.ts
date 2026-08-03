import { Node } from "@xyflow/react";

import { NodeDataType } from "@/types/node-data-type";

/**
 * Creates a node object based on the provided node data.
 *
 * @param nodeData - The data for the node.
 * @returns The created node object.
 */
export const createNodeObj = (nodeData: NodeDataType, parentId?: string): Node => {
  return {
    id: window.crypto.randomUUID(),
    type: nodeData.type,
    dragHandle: ".custom-drag-handle",
    data: nodeData,
    position: { x: 0, y: 0 },
    deletable: true,
    draggable: true,
    selectable: true,
    parentId,
  } as Node;
};
