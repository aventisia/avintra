import { Edge, Node } from "@xyflow/react";

import { MARKER_ARROW_PREFIX } from "@/constants";
import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";

import { getBranchSubgraphNodeIds } from "./getBranchSubNodeIds";
import { getIntermediateNodeIds } from "./getIntermediateNodes";

interface DeleteContext {
  node: Node;
  nodes: Node[];
  edges: Edge[];
  flowVariables: FlowVariablesObjectType[];
  allowBranchDeletion?: boolean; // used only in onNodesDelete to skip alert logic
}

export function getNodesAndEdgesAfterDeletion({
  node,
  nodes,
  edges,
  flowVariables,
  allowBranchDeletion = false,
}: DeleteContext) {
  let updatedNodes = [...nodes];
  let updatedEdges = [...edges];
  let updatedFlowVariables = [...flowVariables];

  // Helper function to reconnect edges after node removal
  const reconnectEdges = (nodeId: string, edges: Edge[]) => {
    // Get incoming edges of the node
    const incomingEdge = edges.find((edge) => edge.target === nodeId);

    //Get outgoing edges  of the node
    const outgoingEdge = edges.find((edge) => edge.source === nodeId);

    const tempEdge = edges.find((edge) => edge.target === nodeId && edge.data?.isTemporary);

    const isTempEdgeCase = tempEdge && incomingEdge && outgoingEdge;

    // Remove edges connected to the node
    const newEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

    if (isTempEdgeCase) {
      const nextNodeId = outgoingEdge!.target;

      const updatedRealEdge: Edge = {
        ...incomingEdge!,
        target: nextNodeId,
      };

      const updatedTempEdge: Edge = {
        ...tempEdge!,
        target: nextNodeId,
        id: `temp-${tempEdge?.data?.groupId}-${nextNodeId}`,
        label: "plus",
        markerEnd: `${MARKER_ARROW_PREFIX}temp-${tempEdge?.data?.groupId}-${nextNodeId}`,
        data: {
          ...tempEdge.data,
          originalTarget: nextNodeId,
        },
      };

      newEdges.push(updatedRealEdge, updatedTempEdge);
      return newEdges;
    }

    // If both incoming and outgoing edges exist, create a new connection
    if (incomingEdge && outgoingEdge) {
      newEdges.push(createPlusEdgeObj(incomingEdge.source, outgoingEdge.target));
    }

    return newEdges;
  };
  const nodeId = node.id;

  const isSpecialNode = node.type === "conditionalNode" || node.type === "forLoopNode";

  const isAINode = node.type === "aiNode";

  const isBranchNode = node.type === "branchNode1";
  const mergeNodeId = node.data?.mergeBranchesNodeId as string;

  if (isBranchNode && mergeNodeId) {
    const isDefaultBranch = nodes.some(
      (n) => n.type === "conditionalNode" && n.data?.defaultBranchNodeId === nodeId,
    );

    if (isDefaultBranch && !allowBranchDeletion) {
      throw new Error("Cannot delete the default branch.");
    }

    const parentNode = nodes.find(
      (n) => n.type === "conditionalNode" && n.data?.mergeBranchesNodeId === mergeNodeId,
    );

    const branches: string[] = (parentNode?.data?.branches ?? []) as string[];

    if (branches.length <= 2 && !allowBranchDeletion) {
      throw new Error("At least two branches are required.");
    }

    const nodeIdsToDelete = getBranchSubgraphNodeIds(nodes, edges, nodeId, mergeNodeId);

    updatedEdges = updatedEdges.filter(
      (edge) => !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target),
    );

    updatedNodes = updatedNodes
      .filter((n) => !nodeIdsToDelete.includes(n.id))
      .map((n) => {
        if (n.id === parentNode?.id) {
          return {
            ...n,
            data: {
              ...n.data,
              branches: branches.filter((id) => id !== nodeId),
            },
          };
        }
        return n;
      });

    updatedFlowVariables = updatedFlowVariables.filter((f) => !nodeIdsToDelete.includes(f.nodeId));
  } else if (isSpecialNode && mergeNodeId) {
    const nodeIdsToDelete = getIntermediateNodeIds(nodes, edges, nodeId);

    updatedEdges = updatedEdges.filter(
      (edge) => !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target),
    );

    const incomingEdge = edges.find(
      (edge) => edge.target === nodeId && edge.targetHandle !== "for-loop-repeat",
    );

    const outgoingEdge = edges.find(
      (edge) => edge.source === mergeNodeId && edge.target !== nodeId,
    );

    if (incomingEdge && outgoingEdge) {
      updatedEdges.push(createPlusEdgeObj(incomingEdge.source, outgoingEdge.target));
    }

    updatedNodes = updatedNodes.filter((n) => !nodeIdsToDelete.includes(n.id));
    updatedFlowVariables = updatedFlowVariables.filter((f) => !nodeIdsToDelete.includes(f.nodeId));
  } else if (isAINode) {
    const modelNodeIds = nodes
      .filter((n) => n.type === "modelNode" && n.parentId === nodeId)
      .map((n) => n.id);

    const nodeIdsToDelete = [nodeId, ...modelNodeIds];

    updatedEdges = updatedEdges.filter((edge) => !modelNodeIds.includes(edge.source));
    updatedEdges = reconnectEdges(nodeId, updatedEdges);

    updatedNodes = updatedNodes.filter((n) => !nodeIdsToDelete.includes(n.id));

    updatedFlowVariables = updatedFlowVariables.filter((f) => !nodeIdsToDelete.includes(f.nodeId));
  } else {
    updatedEdges = reconnectEdges(nodeId, updatedEdges);
    updatedNodes = updatedNodes.filter((n) => n.id !== nodeId);
    updatedFlowVariables = updatedFlowVariables.filter((f) => f.nodeId !== nodeId);
  }

  return {
    updatedNodes,
    updatedEdges,
    updatedFlowVariables,
  };
}
