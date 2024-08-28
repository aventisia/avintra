import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { NodeDataType } from "@/types/node-data-type";
import { createIfElseNode } from "./create-nodes/create-if-else-node";
import { createActivityNode } from "./create-nodes/create-activity-node";

/**
 * Creates nodes and edges based on the provided node data and source node ID.
 *
 * @param nodeData - The data of the node.
 * @param sourceNodeId - The ID of the source node.
 * @returns An object containing the new nodes, new edges, and the ID of the last node.
 */
export const createNodesAndEdgesUtil = (
  nodeData: NodeDataType,
  sourceNodeId: string,
): CreateNodesAndEdgesType => {
  switch (nodeData.type) {
    case "ifElseNode":
      return createIfElseNode(nodeData, sourceNodeId);
    default: {
      return createActivityNode(nodeData, sourceNodeId);
    }
  }
};
