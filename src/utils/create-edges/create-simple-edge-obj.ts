import { Edge } from "@xyflow/react";

/**
 * Creates a dotted edge object.
 *
 * @param sourceNodeId - The ID of the source node.
 * @param targetNodeId - The ID of the target node.
 * @returns The created edge object.
 */
export const createSimpleEdgeObj = (
  sourceNodeId: string,
  targetNodeId: string,
  parentId?: string,
): Edge => {
  // Return the edge object
  return {
    id: window.crypto.randomUUID(),
    source: sourceNodeId,
    target: targetNodeId,
    deletable: false,
    selectable: false,
    parentId,
  } as Edge;
};
