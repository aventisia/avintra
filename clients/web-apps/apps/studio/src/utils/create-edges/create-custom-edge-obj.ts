import {
  MARKER_ARROW_PREFIX,
  STROKE_DASHARRAY,
  STROKE_WIDTH,
} from "@/constants";
import { Edge } from "@xyflow/react";

/**
 * Creates a custom edge object. Default options will create a non-deleteable, solid edge with a marker end arrow.
 *
 * @param sourceNodeId - The ID of the source node.
 * @param targetNodeId - The ID of the target node.
 * @param isDotted - Indicates whether the edge is dotted.
 * @param isDeleteable - Indicates whether the edge is deleteable.
 * @param markerArrow - Indicates whether the edge has a marker end arrow.
 * @param label - The label of the edge.
 * @returns The created edge object.
 */
export const createCustomEdgeObj = (
  sourceNodeId: string,
  targetNodeId: string,
  isDotted: boolean = false,
  isDeleteable: boolean = false,
  markerArrow: boolean = true,
  label?: React.ReactNode | undefined,
): Edge => {
  // Create a unique id for the edge
  const id = window.crypto.randomUUID();

  // Return the edge object
  return {
    id: id,
    type:"customStepEdge",
    source: sourceNodeId,
    target: targetNodeId,
    deletable: isDeleteable,
    selectable: isDeleteable,
    style: {
      strokeDasharray: isDotted ? STROKE_DASHARRAY : undefined,
      strokeWidth: STROKE_WIDTH,
    },
    markerEnd: markerArrow ? `${MARKER_ARROW_PREFIX}${id}` : undefined,
    label,
  } as Edge;
};
