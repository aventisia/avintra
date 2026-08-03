import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";

import { createPlusEdgeObj } from "../create-edges/create-plus-edge-obj";
import { createSupportNodeObj } from "./create-support-node-obj";

/**
 * Creates a flow end node and returns an object containing the new nodes, new edges, and last node ID.
 *
 * @param sourceNodeId - The ID of the source node.
 * @returns An object with the new nodes, new edges, and last node ID.
 */
export const createFlowEndNode = (sourceNodeId: string): CreateNodesAndEdgesType => {
  const newNode = createSupportNodeObj("flowEndNode");
  const newEdge = createPlusEdgeObj(sourceNodeId, newNode.id);
  return {
    newNodes: [newNode],
    newEdges: [newEdge],
    lastNode: newNode,
  };
};
