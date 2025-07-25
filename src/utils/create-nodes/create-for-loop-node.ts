import {
  MARKER_ARROW_PREFIX,
  STROKE_DASHARRAY,
  STROKE_WIDTH,
} from "@/constants";
import { CreateNodesAndEdgesType } from "@/types/create-nodes-and-edges-type";
import { NodeDataType } from "@/types/node-data-type";
import { Edge } from "@xyflow/react";
import { createCustomEdgeObj } from "../create-edges/create-custom-edge-obj";
import { createDottedEdgeObj } from "../create-edges/create-dotted-edge-obj";
import { createPlusEdgeObj } from "../create-edges/create-plus-edge-obj";
import { createNodeObj } from "./create-node-obj";
import { createSupportNodeObj } from "./create-support-node-obj";
import { createBranchEndNodeObj } from "./create-branch-end-node-obj";

export const createForLoopNode = (
  nodeData: NodeDataType,
  sourceNodeId: string,
): CreateNodesAndEdgesType => {
  // For-loop node
  const forLoopNode = createNodeObj(nodeData);

  // Loop-body branch nodes
  const loopBodyStartNode = createSupportNodeObj("branchStartNode");
  const loopBodyPlusNode = createSupportNodeObj("plusNode");
  const loopBodyEndNode = createBranchEndNodeObj("LoopBranch", forLoopNode.id);

  // Merge branches node
  const mergeBranchesNode = createSupportNodeObj("mergeBranchesNode");

  // Source node -> For-loop node
  const source2ForLoopEdge = createPlusEdgeObj(sourceNodeId, forLoopNode.id);

  // For-loop node -> Loop-body branch-start node
  const forLoop2LoopBodyStartEdge = createCustomEdgeObj(
    forLoopNode.id,
    loopBodyStartNode.id,
  );

  // Loop-body branch-start node -> Loop-body plus node
  const loopBodyStart2PlusEdge = createDottedEdgeObj(
    loopBodyStartNode.id,
    loopBodyPlusNode.id,
  );

  // Loop-body plus node -> Loop-body branch-end node
  const loopBodyPlus2BranchEndEdge = createDottedEdgeObj(
    loopBodyPlusNode.id,
    loopBodyEndNode.id,
  );

  // Loop-body branch-end node -> Merge branches node
  const loopBodyEndToMergeBranchesEdge = createCustomEdgeObj(
    loopBodyEndNode.id,
    mergeBranchesNode.id,
  );

  // Merge branches node -> For-loop node
  // const mergeBranches2ForLoopEdge = createCustomEdgeObj(
  //   mergeBranchesNode.id,
  //   forLoopNode.id,
  // );

  const repeatEdgeId = window.crypto.randomUUID();

  const mergeBranches2ForLoopEdge = {
    id: repeatEdgeId,
    source: mergeBranchesNode.id,
    target: forLoopNode.id,
    deletable: false,
    type: "loopBack",
    selectable: false,
    targetHandle: "for-loop-repeat",
    sourceHandle: "branch-return",
    style: {
      strokeDasharray: STROKE_DASHARRAY,
      strokeWidth: STROKE_WIDTH,
    },
    markerEnd: `${MARKER_ARROW_PREFIX}${repeatEdgeId}`,
  } as Edge;

  // Update loop node data (merge branches node ID)
  forLoopNode.data = {
    ...forLoopNode.data,
    mergeBranchesNodeId: mergeBranchesNode.id,
  };

  //Update LoopNode Data
  forLoopNode.data = {
    ...forLoopNode.data,
    mergeBranchesNodeId: mergeBranchesNode.id,
  };

  // Return the nodes and edges
  return {
    newNodes: [
      forLoopNode,
      loopBodyStartNode,
      loopBodyPlusNode,
      loopBodyEndNode,
      mergeBranchesNode,
    ],
    newEdges: [
      source2ForLoopEdge,
      forLoop2LoopBodyStartEdge,
      loopBodyStart2PlusEdge,
      loopBodyPlus2BranchEndEdge,
      loopBodyEndToMergeBranchesEdge,
      mergeBranches2ForLoopEdge,
    ],
    lastNode: mergeBranchesNode,
  };
};
