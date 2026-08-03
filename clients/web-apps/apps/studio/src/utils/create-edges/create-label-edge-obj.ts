import { Edge } from "@xyflow/react";

import { MARKER_ARROW_PREFIX, STROKE_WIDTH } from "@/constants";

/**
 * Creates an edge object with label.
 *
 * @param sourceNodeId - The ID of the source node.
 * @param targetNodeId - The ID of the target node.
 * @param label - The label for the edge.
 * @returns The created edge object with label.
 */
export const createLabelEdgeObj = (
  sourceNodeId: string,
  targetNodeId: string,
  label: string | React.ReactNode,
): Edge => {
  // Create a unique id for the edge
  const id = window.crypto.randomUUID();

  // Return the edge object
  return {
    id: id,
    source: sourceNodeId,
    target: targetNodeId,
    deletable: false,
    selectable: false,
    style: { strokeWidth: STROKE_WIDTH },

    markerEnd: `${MARKER_ARROW_PREFIX}${id}`,
    label,
  } as Edge;
};
