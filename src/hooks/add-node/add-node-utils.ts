import { NodeDataType } from "@/types/node-data-type";
import { Edge, Node } from "@xyflow/react";
import { createSupportNodeObj } from "./create-support-node";
import { createDottedEdgeObj, createEdgeObj, createEdgeWithLabelObj } from "./create-edge";
import { createNodeObj } from "./create-node";

type NodesEdgesObjType = {
  newNodes: Node[];
  newEdges: Edge[];
  /** The source Id of the last node of newly created nodes array */
  lastNodeId: string;
};

/** Create nodes and edges object */
export const createNodesEdgesObj = (
  nodeData: NodeDataType,
  sourceNodeId: string,
): NodesEdgesObjType => {
  switch (nodeData.type) {
    case "ifElseNode": {
      // If else node
      const startNode = createNodeObj(nodeData);

      // True branch nodes
      const trueBranchStartNode = createSupportNodeObj("branchStartNode");
      const trueNode = createSupportNodeObj("placeholderNode");
      const trueBranchEndNode = createSupportNodeObj("branchEndNode");

      // False branch nodes
      const falseBranchStartNode = createSupportNodeObj("branchStartNode");
      const falseNode = createSupportNodeObj("placeholderNode");
      const falseBranchEndNode = createSupportNodeObj("branchEndNode");
      
      // MergeEdges node
      const endNode = createSupportNodeObj("mergeBranchesNode");

      // Source node -> if else node
      const sourceToStartEdge = createEdgeObj(sourceNodeId, startNode.id);
      
      // If else node -> true branch edges
      const startToTrueBranchEdge = createEdgeWithLabelObj(
        startNode.id,
        trueBranchStartNode.id,
        "TrueEdgeLabel",
      );
      const trueBranchToTrueEdge = createDottedEdgeObj(trueBranchStartNode.id, trueNode.id);
      const trueToEndBranchEdge = createDottedEdgeObj(
        trueNode.id,
        trueBranchEndNode.id,
      );
      const trueBranchEndToEndEdge = createEdgeWithLabelObj(trueBranchEndNode.id, endNode.id);

      // If else node -> false branch edges
      const startToFalseBranchEdge = createEdgeWithLabelObj(
        startNode.id,
        falseBranchStartNode.id,
        "FalseEdgeLabel",
      );
      const falseBranchToFalseEdge = createDottedEdgeObj(falseBranchStartNode.id, falseNode.id);
      const falseToEndBranchEdge = createDottedEdgeObj(
        falseNode.id,
        falseBranchEndNode.id,
      );
      const falseBranchEndToEndEdge = createEdgeWithLabelObj(falseBranchEndNode.id, endNode.id);

      // Return the nodes and edges
      return {
        newNodes: [
          startNode,
          trueBranchStartNode,
          falseBranchStartNode,
          trueNode,
          falseNode,
          trueBranchEndNode,
          falseBranchEndNode,
          endNode,
        ],
        newEdges: [
          sourceToStartEdge,
          startToTrueBranchEdge,
          startToFalseBranchEdge,
          trueBranchToTrueEdge,
          falseBranchToFalseEdge,
          trueToEndBranchEdge,
          falseToEndBranchEdge,
          trueBranchEndToEndEdge,
          falseBranchEndToEndEdge,
        ],
        lastNodeId: endNode.id,
      };
    }
    // Activity node is the default node type
    default: {
      const newNode = createNodeObj(nodeData);
      const newEdge = createEdgeObj(sourceNodeId, newNode.id);
      return {
        newNodes: [newNode],
        newEdges: [newEdge],
        lastNodeId: newNode.id,
      };
    }
  }
};

/** Create flow end node and edge */
export const createFlowEndNodeEdgeObj = (
  sourceNodeId: string,
): {
  flowEndNode: Node;
  flowEndEdge: Edge;
} => {
  const flowEndNode = createSupportNodeObj("flowEndNode");
  const flowEndEdge = createEdgeObj(sourceNodeId, flowEndNode.id);
  return {
    flowEndNode,
    flowEndEdge,
  };
};
