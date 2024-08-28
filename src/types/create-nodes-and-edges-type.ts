import { Edge, Node } from "@xyflow/react";

/**
 * Represents the return type of the `createNodesAndEdges` function.
 */
export type CreateNodesAndEdgesType = {
  /** The newly created nodes */
  newNodes: Node[];

  /** The newly created edges */
  newEdges: Edge[];

  /** The source Id of the last node of newly created nodes array */
  lastNodeId: string;
};
