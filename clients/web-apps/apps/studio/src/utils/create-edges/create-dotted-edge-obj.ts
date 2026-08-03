import { Edge } from "@xyflow/react";

import { STROKE_DASHARRAY, STROKE_WIDTH } from "@/constants";

/**
 * Creates a dotted edge object.
 *
 * @param sourceNodeId - The ID of the source node.
 * @param targetNodeId - The ID of the target node.
 * @returns The created edge object.
 */
export const createDottedEdgeObj = (
  sourceNodeId: string,
  targetNodeId: string,
  parentId?: string,
  targetHandle?: string,
): Edge => {
  // Return the edge object
  return {
    id: window.crypto.randomUUID(),
    source: sourceNodeId,
    target: targetNodeId,
    deletable: false,
    selectable: false,
    style: { strokeDasharray: STROKE_DASHARRAY, strokeWidth: STROKE_WIDTH },
    parentId,
    targetHandle,
  } as Edge;
};
