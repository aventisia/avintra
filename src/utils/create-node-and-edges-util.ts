import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { CustomNodeType } from "@/types/custom-node-type";
import { NodeDataType } from "@/types/node-data-type";
import { XYPosition } from "@xyflow/react";
import { createActivityNode } from "./create-nodes/create-activity-node";
import { createFlowEndNode } from "./create-nodes/create-flow-end-node";
import { createIfElseNode } from "./create-nodes/create-if-else-node";

/**
 * Creates nodes and edges based on the provided node data and source node ID.
 *
 * @param nodeData - The data of the node.
 * @param sourceNodeId - The ID of the source node.
 * @returns An object containing the new nodes, new edges, and the ID of the last node.
 */
export const createNodesAndEdgesUtil = (
  sourceNodeId: string,
  nodeData: NodeDataType,
  sourceNodeXY?: XYPosition,
  nodeType?: CustomNodeType,
): CreateNodesAndEdgesType => {
  // Object to store the new nodes and edges
  let nodesAndEdgesObj: CreateNodesAndEdgesType = {
    newNodes: [],
    newEdges: [],
    lastNodeId: "",
  };

  // Create the node and edge based on the node type
  switch (nodeType ? nodeType : nodeData.type) {
    case "ifElseNode":
      nodesAndEdgesObj = createIfElseNode(nodeData, sourceNodeId);
      break;
    case "activityNode":
      nodesAndEdgesObj = createActivityNode(nodeData, sourceNodeId);
      break;
    case "flowEndNode":
      nodesAndEdgesObj = createFlowEndNode(sourceNodeId);
      break;
    default:
      return nodesAndEdgesObj;
  }

  // Update the position of the all nodes
  if (sourceNodeXY && nodesAndEdgesObj.newNodes.length > 0) {
    nodesAndEdgesObj.newNodes = nodesAndEdgesObj.newNodes.map((node) => ({
      ...node,
      position: {
        x: sourceNodeXY.x,
        y: sourceNodeXY.y,
      },
    }));
  }

  // Return the new nodes and edges
  return nodesAndEdgesObj;
};
