import { MARKER_ARROW_PREFIX, STROKE_WIDTH } from "@/constants";
import { Edge } from "@xyflow/react";

/**
 * Creates a edge object, plus button as label.
 *
 * @param sourceNodeId - The ID of the source node.
 * @param targetNodeId - The ID of the target node.
 * @returns The created edge object.
 */
export const createPlusEdgeObj = (
    sourceNodeId: string,
    targetNodeId: string,
  ): Edge => {
    // Create a unique id for the edge
    const id = window.crypto.randomUUID();
  
    // Return the edge object
    return {
      id: id,
      source: sourceNodeId,
      target: targetNodeId,
      markerEnd: `${MARKER_ARROW_PREFIX}${id}`,
      deletable: true,
        style: { strokeWidth: STROKE_WIDTH },

      label: "plus",
    } as Edge;
  };