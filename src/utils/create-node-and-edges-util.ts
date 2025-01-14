import { nodeDimensionLookup } from "@/constants/node-dimension-lookup";
import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { CustomNodeType } from "@/types/custom-node-type";
import { NodeDataType } from "@/types/node-data-type";
import { Node, XYPosition } from "@xyflow/react";
import { createActivityNode } from "./create-nodes/create-activity-node";
import { createFlowEndNode } from "./create-nodes/create-flow-end-node";
import { createForLoopNode } from "./create-nodes/create-for-loop-node";
import { createIfElseNode } from "./create-nodes/create-if-else-node";
import { createSwitchCaseNode } from "./create-nodes/create-switch-case-node";

/**
 * Creates nodes and edges based on the provided node data and source node ID.
 *
 * @param sourceNode - The source node.
 * @param newNodeData - The data of the node.
 * @param newNodeType - The type of the node.
 * @returns An object containing the new nodes, new edges, and the ID of the last node.
 */
const createNodesAndEdgesUtil = (
  sourceNode: Node,
  newNodeData: NodeDataType,
  newNodeType?: CustomNodeType,
): CreateNodesAndEdgesType => {
  // Object to store the new nodes and edges
  let nodesAndEdgesObj: CreateNodesAndEdgesType = {
    newNodes: [],
    newEdges: [],
    lastNode: {} as Node,
  };

  // Create the node and edge based on the node type
  switch (newNodeType ? newNodeType : newNodeData.type) {
    case "ifElseNode":
      nodesAndEdgesObj = createIfElseNode(newNodeData, sourceNode.id);
      break;
    case "switchCaseNode":
      nodesAndEdgesObj = createSwitchCaseNode(newNodeData, sourceNode.id);
      break;
    case "forLoopNode":
      nodesAndEdgesObj = createForLoopNode(newNodeData, sourceNode.id);
      break;
    case "activityNode":
      nodesAndEdgesObj = createActivityNode(newNodeData, sourceNode);
      break;
    case "flowEndNode":
      nodesAndEdgesObj = createFlowEndNode(sourceNode.id);
      break;
    default:
      return nodesAndEdgesObj;
  }

  // Update the position of the all nodes
  if (nodesAndEdgesObj.newNodes.length > 0) {
    nodesAndEdgesObj.newNodes = nodesAndEdgesObj.newNodes.map((node) => ({
      ...node,
      position: getNewNodeXY(sourceNode, node.type as CustomNodeType),
    }));
  }

  // Return the new nodes and edges
  return nodesAndEdgesObj;
};

const getNewNodeXY = (
  sourceNode: Node,
  newNodeType: CustomNodeType,
): XYPosition => {
  // Get source node dimensions
  const sourceNodeDimension =
    nodeDimensionLookup[sourceNode.type as CustomNodeType];

  // Get new node dimensions
  const newNodeDimension = nodeDimensionLookup[newNodeType];

  // Calculate the center of the source node
  const centerX = sourceNode.position.x + sourceNodeDimension.width / 2;
  const centerY = sourceNode.position.y + sourceNodeDimension.height / 2;

  // Calculate the new node position
  const x = centerX - newNodeDimension.width / 2;
  const y = centerY - newNodeDimension.height / 2;

  // Return the center coordinates
  return { x, y };
};

export { createNodesAndEdgesUtil, getNewNodeXY };