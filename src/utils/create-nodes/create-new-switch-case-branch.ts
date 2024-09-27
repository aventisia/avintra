import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { Node } from "@xyflow/react";
import { createCustomEdgeObj } from "../create-edges/create-custom-edge-obj";
import { createDottedEdgeObj } from "../create-edges/create-dotted-edge-obj";
import { createLabelEdgeObj } from "../create-edges/create-label-edge-obj";
import { getNewNodeXY } from "../create-node-and-edges-util";
import { createSupportNodeObj } from "./create-support-node-obj";
import { CustomNodeType } from "@/types/custom-node-type";

export const createNewSwitchCaseBranch = (
  sourceNode: Node,
  mergeBranchesNodeId: string
): CreateNodesAndEdgesType => {
  // Case branch nodes
  const caseBranchStartNode = createSupportNodeObj("branchStartNode");
  const casePlusNode = createSupportNodeObj("plusNode", true);
  const caseBranchEndNode = createSupportNodeObj("branchEndNode");

  // Switch-case node -> Case branch-start node
  const switchCase2CaseBranchStartEdge = createLabelEdgeObj(
    sourceNode.id,
    caseBranchStartNode.id,
    "New case",
  );

  // Case branch-start node -> Case plus node
  const caseBranchStart2PlusEdge = createDottedEdgeObj(
    caseBranchStartNode.id,
    casePlusNode.id,
  );

  // Case plus node -> Case branch-end node
  const casePlus2CaseBranchEndEdge = createDottedEdgeObj(
    casePlusNode.id,
    caseBranchEndNode.id,
  );

  // Case branch-end node -> Merge branches node
  const caseBranchEndToMergeBranchesEdge = createCustomEdgeObj(
    caseBranchEndNode.id,
    mergeBranchesNodeId,
  );

  // Swtich-case branch nodes and edges
  const nodesAndEdgesObj = {
    newNodes: [
      caseBranchStartNode,
      casePlusNode,
      caseBranchEndNode,
    ],
    newEdges: [
      switchCase2CaseBranchStartEdge,
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
