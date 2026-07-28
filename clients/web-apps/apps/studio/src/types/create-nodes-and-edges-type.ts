import { Edge, Node } from "@xyflow/react";

/**
 * Represents the return type of the `createNodesAndEdges` function.
 */
export type CreateNodesAndEdgesType = {
  /** The newly created nodes */
  newNodes: Node[];

  /** The newly created edges */
  newEdges: Edge[];

  /** The the last node of newly created nodes array */
  lastNode: Node;
};
