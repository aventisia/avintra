import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { NodeDataType } from "@/types/node-data-type";
import { createPlusEdgeObj } from "../create-edges/create-plus-edge-obj";
import { createNodeObj } from "./create-node-obj";
import { Node } from "@xyflow/react";

/**
 * Creates an cloud connector node and returns an object containing the new node, new edge, and last node ID.
 *
 * @param nodeData - The data for the new node.
 * @param sourceNode - The source node.
 * @returns An object with the new nodes, new edges, and last node ID.
 */
export const createCloudConnectorNode = (
  nodeData: NodeDataType,
  sourceNode: Node,
): CreateNodesAndEdgesType => {
  const newNode = createNodeObj(nodeData, sourceNode.parentId);
  const newEdge = createPlusEdgeObj(sourceNode.id, newNode.id);
  return {
    newNodes: [newNode],
    newEdges: [newEdge],
    lastNode: newNode,
  };
};
