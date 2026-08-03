import { Node } from "@xyflow/react";

import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { CustomNodeType } from "@/types/custom-node-type";

import { createCustomEdgeObj } from "../create-edges/create-custom-edge-obj";
import { createDottedEdgeObj } from "../create-edges/create-dotted-edge-obj";
import { createSimpleEdgeObj } from "../create-edges/create-simple-edge-obj";
import { getNewNodeXY } from "../create-node-and-edges-util";
import { createBranchEndNodeObj } from "./create-branch-end-node-obj";
import { createSupportNodeObj } from "./create-support-node-obj";

export const createNewConditionalBranch = (
  sourceNode: Node,
  newBranchStartNode: Node,
  mergeBranchesNodeId: string,
): CreateNodesAndEdgesType => {
  // Case branch nodes
  const casePlusNode = createSupportNodeObj("plusNode");
  const caseBranchEndNode = createBranchEndNodeObj("CondtionalBranch", sourceNode.id);

  // Conditional node -> Case branch-start node
  const conditional2CaseBranchStartEdge = createSimpleEdgeObj(
    sourceNode.id,
    newBranchStartNode.id,
    sourceNode.id,
  );

  // Case branch-start node -> Case plus node
  const caseBranchStart2PlusEdge = createDottedEdgeObj(newBranchStartNode.id, casePlusNode.id);

  // Case plus node -> Case branch-end node
  const casePlus2CaseBranchEndEdge = createDottedEdgeObj(casePlusNode.id, caseBranchEndNode.id);

  // Case branch-end node -> Merge branches node
  const caseBranchEndToMergeBranchesEdge = createCustomEdgeObj(
    caseBranchEndNode.id,
    mergeBranchesNodeId,
  );

  // Swtich-case branch nodes and edges
  const nodesAndEdgesObj = {
    newNodes: [newBranchStartNode, casePlusNode, caseBranchEndNode],
    newEdges: [
      conditional2CaseBranchStartEdge,
      caseBranchStart2PlusEdge,
      casePlus2CaseBranchEndEdge,
      caseBranchEndToMergeBranchesEdge,
    ],
    lastNode: caseBranchEndNode,
  };

  // Update the position of the all nodes
  if (nodesAndEdgesObj.newNodes.length > 0) {
    nodesAndEdgesObj.newNodes = nodesAndEdgesObj.newNodes.map((node) => ({
      ...node,
      position: getNewNodeXY(sourceNode, node.type as CustomNodeType),
    }));
  }

  // Return the nodes and edges
  return nodesAndEdgesObj;
};
