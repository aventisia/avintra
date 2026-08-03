import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { NodeDataType } from "@/types/node-data-type";

import { createCustomEdgeObj } from "../create-edges/create-custom-edge-obj";
import { createDottedEdgeObj } from "../create-edges/create-dotted-edge-obj";
import { createPlusEdgeObj } from "../create-edges/create-plus-edge-obj";
import { createSimpleEdgeObj } from "../create-edges/create-simple-edge-obj";
import { createConditionalBranchNodeObj } from "./conditional/create-conditional-branch-node-obj";
import { createBranchEndNodeObj } from "./create-branch-end-node-obj";
import { createNodeObj } from "./create-node-obj";
import { createSupportNodeObj } from "./create-support-node-obj";

export const createConditionalNode = (
  nodeData: NodeDataType,
  sourceNodeId: string,
): CreateNodesAndEdgesType => {
  // conditional node
  const conditionalNode = createNodeObj(nodeData);

  // Merge branches node
  const mergeBranchesNode = createSupportNodeObj("mergeBranchesNode");

  // Case branch nodes
  const caseBranchStartNode = createConditionalBranchNodeObj("Branch", false, mergeBranchesNode.id);
  const casePlusNode = createSupportNodeObj("plusNode");
  const caseBranchEndNode = createBranchEndNodeObj("CondtionalBranch", conditionalNode.id);

  // Default branch nodes
  const defaultBranchStartNode = createConditionalBranchNodeObj(
    "Default",
    true,
    mergeBranchesNode.id,
  );
  const defaultPlusNode = createSupportNodeObj("plusNode");
  const defaultBranchEndNode = createBranchEndNodeObj("CondtionalBranch", conditionalNode.id);

  // Source node -> conditional node
  const source2ConditionalEdge = createPlusEdgeObj(sourceNodeId, conditionalNode.id);

  // conditional node -> Case branch-start node
  const conditional2CaseBranchStartEdge = createSimpleEdgeObj(
    conditionalNode.id,
    caseBranchStartNode.id,
    conditionalNode.id,
  );

  // Case branch-start node -> Case plus node
  const caseBranchStart2PlusEdge = createDottedEdgeObj(caseBranchStartNode.id, casePlusNode.id);

  // Case plus node -> Case branch-end node
  const casePlus2CaseBranchEndEdge = createDottedEdgeObj(casePlusNode.id, caseBranchEndNode.id);

  // Case branch-end node -> Merge branches node
  const caseBranchEndToMergeBranchesEdge = createCustomEdgeObj(
    caseBranchEndNode.id,
    mergeBranchesNode.id,
  );

  // conditional node -> Default-case branch-start node
  const conditional2DefaultBranchEdge = createSimpleEdgeObj(
    conditionalNode.id,
    defaultBranchStartNode.id,
    conditionalNode.id,
  );

  // Default-case branch-start node -> Default-case plus node
  const defaultBranchStart2PlusEdge = createDottedEdgeObj(
    defaultBranchStartNode.id,
    defaultPlusNode.id,
  );

  // Default-case plus node -> Default-case branch-end node
  const defaultPlus2DefaultBranchEndEdge = createDottedEdgeObj(
    defaultPlusNode.id,
    defaultBranchEndNode.id,
  );

  // Default-case branch-end node -> Merge branches node
  const defaultBranchEndToMergeBranchesEdge = createCustomEdgeObj(
    defaultBranchEndNode.id,
    mergeBranchesNode.id,
  );

  // Update conditional node data
  conditionalNode.data = {
    ...conditionalNode.data,
    branches: [caseBranchStartNode.id, defaultBranchStartNode.id], // One main branch and one default branch
    defaultBranchNodeId: defaultBranchStartNode.id,
    mergeBranchesNodeId: mergeBranchesNode.id,
    conditional2DefaultBranchEdgeId: conditional2DefaultBranchEdge.id,
  };

  caseBranchStartNode.data = {
    ...caseBranchStartNode.data,
    mergeBranchesNodeId: mergeBranchesNode.id,
  };
  // Return the nodes and edges
  return {
    newNodes: [
      conditionalNode,
      caseBranchStartNode,
      defaultBranchStartNode,
      casePlusNode,
      defaultPlusNode,
      caseBranchEndNode,
      defaultBranchEndNode,
      mergeBranchesNode,
    ],
    newEdges: [
      source2ConditionalEdge,
      conditional2CaseBranchStartEdge,
      caseBranchStart2PlusEdge,
      casePlus2CaseBranchEndEdge,
      caseBranchEndToMergeBranchesEdge,
      conditional2DefaultBranchEdge,
      defaultBranchStart2PlusEdge,
      defaultPlus2DefaultBranchEndEdge,
      defaultBranchEndToMergeBranchesEdge,
    ],
    lastNode: mergeBranchesNode,
  };
};
