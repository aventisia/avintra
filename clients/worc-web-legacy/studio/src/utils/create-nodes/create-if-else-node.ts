import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { NodeDataType } from "@/types/node-data-type";
import { createCustomEdgeObj } from "../create-edges/create-custom-edge-obj";
import { createDottedEdgeObj } from "../create-edges/create-dotted-edge-obj";
import { createLabelEdgeObj } from "../create-edges/create-label-edge-obj";
import { createPlusEdgeObj } from "../create-edges/create-plus-edge-obj";
import { createNodeObj } from "./create-node-obj";
import { createSupportNodeObj } from "./create-support-node-obj";

/**
 * Creates an if-else node with its associated branches and edges.
 *
 * @param nodeData - The data for the if-else node.
 * @param sourceNodeId - The ID of the source node.
 * @returns An object containing the new nodes, edges, and the ID of the last node.
 */
export const createIfElseNode = (
  nodeData: NodeDataType,
  sourceNodeId: string,
): CreateNodesAndEdgesType => {
  // If-else node
  const ifElseNode = createNodeObj(nodeData);

  // True branch nodes
  const trueBranchStartNode = createSupportNodeObj("branchStartNode",ifElseNode.id);
  const truePlusNode = createSupportNodeObj("plusNode",ifElseNode.id);
  const trueBranchEndNode = createSupportNodeObj("branchEndNode",ifElseNode.id);

  // False branch nodes
  const falseBranchStartNode = createSupportNodeObj("branchStartNode",ifElseNode.id);
  const falsePlusNode = createSupportNodeObj("plusNode",ifElseNode.id);
  const falseBranchEndNode = createSupportNodeObj("branchEndNode",ifElseNode.id);

  // Merge branches node
  const mergeBranchesNode = createSupportNodeObj("mergeBranchesNode",ifElseNode.id);

  // Source node -> If-else node
  const source2IfElseEdge = createPlusEdgeObj(sourceNodeId, ifElseNode.id);

  // If-else node -> True branch-start node
  const ifElse2TrueBranchStartEdge = createLabelEdgeObj(
    ifElseNode.id,
    trueBranchStartNode.id,
    "true",
  );

  // True branch-start node -> True plus node
  const trueBranchStart2PlusEdge = createDottedEdgeObj(
    trueBranchStartNode.id,
    truePlusNode.id,
  );

  // True plus node -> True branch-end node
  const truePlus2BranchEndEdge = createDottedEdgeObj(
    truePlusNode.id,
    trueBranchEndNode.id,
  );

  // True branch-end node -> Merge branches node
  const trueBranchEndToMergeBranchesEdge = createCustomEdgeObj(
    trueBranchEndNode.id,
    mergeBranchesNode.id,
  );

  // If-else node -> False branch-start node
  const ifElse2FalseBranchStartEdge = createLabelEdgeObj(
    ifElseNode.id,
    falseBranchStartNode.id,
    "false",
  );

  // False branch-start node -> False plus node
  const falseBranchStart2PlusEdge = createDottedEdgeObj(
    falseBranchStartNode.id,
    falsePlusNode.id,
  );

  // False plus node -> False branch-end node
  const falsePlus2BranchEndEdge = createDottedEdgeObj(
    falsePlusNode.id,
    falseBranchEndNode.id,
  );

  // False branch-end node -> Merge branches node
  const falseBranchEndToMergeBranchesEdge = createCustomEdgeObj(
    falseBranchEndNode.id,
    mergeBranchesNode.id,
  );

  // Return the nodes and edges
  return {
    newNodes: [
      ifElseNode,
      trueBranchStartNode,
      falseBranchStartNode,
      truePlusNode,
      falsePlusNode,
      trueBranchEndNode,
      falseBranchEndNode,
      mergeBranchesNode,
    ],
    newEdges: [
      source2IfElseEdge,
      ifElse2TrueBranchStartEdge,
      trueBranchStart2PlusEdge,
      truePlus2BranchEndEdge,
      trueBranchEndToMergeBranchesEdge,
      ifElse2FalseBranchStartEdge,
      falseBranchStart2PlusEdge,
      falsePlus2BranchEndEdge,
      falseBranchEndToMergeBranchesEdge,
    ],
    lastNode: mergeBranchesNode,
  };
};
