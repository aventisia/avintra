import { NODE_HEIGHT, NODE_WIDTH } from "@/constants";
import { nodeDimensionLookup } from "@/constants/node-dimension-lookup";
import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { CustomNodeType } from "@/types/custom-node-type";
import { NodeDataType } from "@/types/node-data-type";

import { Node, XYPosition } from "@xyflow/react";

import { createActivityNode } from "./create-nodes/create-activity-node";
import { createAgentNode } from "./create-nodes/create-agent-node";
import { createAINode } from "./create-nodes/create-ai-node";
import { createBlockNode } from "./create-nodes/create-block-node";
import { createCloudConnectorNode } from "./create-nodes/create-cloud-connector-node";
import { createConditionalNode } from "./create-nodes/create-conditional-node";
import { createFlowEndNode } from "./create-nodes/create-flow-end-node";
import { createForLoopNode } from "./create-nodes/create-for-loop-node";
import { createIfElseNode } from "./create-nodes/create-if-else-node";

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
    case "conditionalNode":
      nodesAndEdgesObj = createConditionalNode(newNodeData, sourceNode.id);
      break;
    case "forLoopNode":
      nodesAndEdgesObj = createForLoopNode(newNodeData, sourceNode.id);
      break;
    case "activityNode":
      nodesAndEdgesObj = createActivityNode(newNodeData, sourceNode);
      break;
    case "cloudConnectorNode":
      nodesAndEdgesObj = createCloudConnectorNode(newNodeData, sourceNode);
      break;
    case "flowEndNode":
      nodesAndEdgesObj = createFlowEndNode(sourceNode.id);
      break;
    case "aiNode":
      nodesAndEdgesObj = createAINode(newNodeData, sourceNode);
      break;
    case "blockNode":
      nodesAndEdgesObj = createBlockNode(newNodeData, sourceNode);
      break;
    case "callAgentNode":
      nodesAndEdgesObj = createAgentNode(newNodeData, sourceNode);
      break;
    default:
      return nodesAndEdgesObj;
  }

  // Update the position of the all nodes
  if (nodesAndEdgesObj.newNodes.length > 0) {
    nodesAndEdgesObj.newNodes = nodesAndEdgesObj.newNodes.map((node) => ({
      ...node,
      position:
        node.type == "modelNode"
          ? {
              x: NODE_WIDTH,
              y: 1.75 * NODE_HEIGHT,
            }
          : getNewNodeXY(sourceNode, node.type as CustomNodeType),
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
