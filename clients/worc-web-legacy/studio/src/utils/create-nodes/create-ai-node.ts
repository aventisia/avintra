import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { NodeDataType } from "@/types/node-data-type";

import { Node } from "@xyflow/react";

import { createDottedEdgeObj } from "../create-edges/create-dotted-edge-obj";
import { createPlusEdgeObj } from "../create-edges/create-plus-edge-obj";
import { createNodeObj } from "./create-node-obj";
import { createSupportNodeObj } from "./create-support-node-obj";

/**
 * Creates an ai node and returns an object containing the new node, new edge, and last node ID.
 *
 * @param nodeData - The data for the new node.
 * @param sourceNodeId - The ID of the source node.
 * @returns An object with the new nodes, new edges, and last node ID.
 */
export const createAINode = (
  nodeData: NodeDataType,
  sourceNode: Node,
): CreateNodesAndEdgesType => {
  const newNode = createNodeObj(nodeData, sourceNode.parentId);

  // 1. Create the Support/Satellite Node
  // Position it below the AI node (e.g., y + 150)
  const modelNode = createSupportNodeObj("modelNode", newNode.id, true);
  // const memoryNode = createSupportNodeObj("plusNode", sourceNode.parentId);
  // const toolsNode = createSupportNodeObj("plusNode", sourceNode.parentId);

  // 2. Main Flow Edge (Trigger -> AI)
  const mainEdge = createPlusEdgeObj(sourceNode.id, newNode.id);

  // 3. Satellite Edge (Model Node -> AI Node)
  // Note: source is modelNode, target is newNode, targeting the specific handle
  const modelEdge = createDottedEdgeObj(
    modelNode.id,
    newNode.id,
    sourceNode.parentId,
    "model-node", // This matches the ID in the AINode
  );

  // const memoryEdge = createSimpleEdgeObj(
  //   memoryNode.id,
  //   newNode.id,
  //   sourceNode.parentId,
  //   "memory-input", // This matches the ID in the AINode
  //   "Memory"
  // );
  // const toolsEdge = createSimpleEdgeObj(
  //   toolsNode.id,
  //   newNode.id,
  //   sourceNode.parentId,
  //   "tools-input", // This matches the ID in the AINode
  //   "Tools"
  // );

  return {
    newNodes: [newNode, modelNode],
    newEdges: [mainEdge, modelEdge],
    // newNodes: [newNode, modelNode, memoryNode, toolsNode],
    // newEdges: [mainEdge, modelEdge, memoryEdge, toolsEdge],
    lastNode: newNode,
  };
};
