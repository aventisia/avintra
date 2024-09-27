import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { NodeDataType } from "@/types/node-data-type";
import { createCustomEdgeObj } from "../create-edges/create-custom-edge-obj";
import { createDottedEdgeObj } from "../create-edges/create-dotted-edge-obj";
import { createLabelEdgeObj } from "../create-edges/create-label-edge-obj";
import { createPlusEdgeObj } from "../create-edges/create-plus-edge-obj";
import { createNodeObj } from "./create-node-obj";
import { createSupportNodeObj } from "./create-support-node-obj";

export const createSwitchCaseNode = (
  nodeData: NodeDataType,
  sourceNodeId: string,
): CreateNodesAndEdgesType => {
  // Switch-case node
  const switchCaseNode = createNodeObj(nodeData);

  // Case branch nodes
  const caseBranchStartNode = createSupportNodeObj("branchStartNode");
  const casePlusNode = createSupportNodeObj("plusNode", true);
  const caseBranchEndNode = createSupportNodeObj("branchEndNode");

  // Default branch nodes
  const defaultBranchStartNode = createSupportNodeObj("branchStartNode");
  const defaultPlusNode = createSupportNodeObj("plusNode", true);
  const defaultBranchEndNode = createSupportNodeObj("branchEndNode");

  // Merge branches node
  const mergeBranchesNode = createSupportNodeObj("mergeBranchesNode");

  // Source node -> Switch-case node
  const source2SwitchCaseEdge = createPlusEdgeObj(sourceNodeId, switchCaseNode.id);

  // Switch-case node -> Case branch-start node
  const switchCase2CaseBranchStartEdge = createLabelEdgeObj(
    switchCaseNode.id,
    caseBranchStartNode.id,
    "Case 1",
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
    mergeBranchesNode.id,
  );

  // Switch-case node -> Default-case branch-start node
  const switchCase2DefaultBranchStartEdge = createLabelEdgeObj(
    switchCaseNode.id,
    defaultBranchStartNode.id,
    "Default",
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

  // Update switch-case node data
  switchCaseNode.data = {
    ...switchCaseNode.data,
    defaultBranchStartNodeId: defaultBranchStartNode.id,
    mergeBranchesNodeId: mergeBranchesNode.id,
    switchCase2DefaultBranchStartEdgeId: switchCase2DefaultBranchStartEdge.id,
  };

  // Return the nodes and edges
  return {
    newNodes: [
      switchCaseNode,
      caseBranchStartNode,
      defaultBranchStartNode,
      casePlusNode,
      defaultPlusNode,
      caseBranchEndNode,
      defaultBranchEndNode,
      mergeBranchesNode,
    ],
    newEdges: [
      source2SwitchCaseEdge,
      switchCase2CaseBranchStartEdge,
      caseBranchStart2PlusEdge,
      casePlus2CaseBranchEndEdge,
      caseBranchEndToMergeBranchesEdge,
      switchCase2DefaultBranchStartEdge,
      defaultBranchStart2PlusEdge,
      defaultPlus2DefaultBranchEndEdge,
      defaultBranchEndToMergeBranchesEdge,
    ],
    lastNode: mergeBranchesNode,
  };
};
