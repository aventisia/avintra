import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import {
  isSingleNodeAgentFlow,
  notifySingleNodeAgentActionNotAllowed,
} from "@/features/react-flow/utils/single-node-agent-flow.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { createConditionalBranchNodeObj } from "@/utils/create-nodes/conditional/create-conditional-branch-node-obj";
import { createNewConditionalBranch } from "@/utils/create-nodes/create-new-conditional-branch";

import { useDagreAutoLayout } from "./useDagreAutoLayout";

export const useAddConditionalBranch = () => {
  const { updateNodeData } = useReactFlow();
  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  // Handler to add first node to flow
  const addConditionalBranch = useCallback(
    (
      nodeData: ConditionalNodeDataType,
      switchNodeId: string,
      kind: "case" | "default" = "case",
    ) => {
      // JIT State Fetching: Get latest state instantly without subscribing
      const { nodes, edges, flowType, setNodes, setEdges } = useReactFlowExtStore.getState();
      if (isSingleNodeAgentFlow(flowType)) {
        notifySingleNodeAgentActionNotAllowed(flowType);
        return;
      }

      const sourceNode = nodes.find((node) => node.id === switchNodeId);
      if (!sourceNode) return;

      const isDefault = kind === "default";
      if (isDefault && nodeData.defaultBranchNodeId) return;
      const caseBranches = nodeData.branches.filter((id) => id !== nodeData.defaultBranchNodeId);
      // new branch start node
      const newBranchStartNode = isDefault
        ? createConditionalBranchNodeObj("Default", true, nodeData.mergeBranchesNodeId)
        : createConditionalBranchNodeObj(
            `Branch ${caseBranches.length}`,
            false,
            nodeData.mergeBranchesNodeId,
          );
      updateNodeData(nodeData.mergeBranchesNodeId, {
        incomingBranches: nodeData.branches.length,
      });
      // Create new node & edge
      const { newNodes, newEdges } = createNewConditionalBranch(
        sourceNode,
        newBranchStartNode,
        nodeData.mergeBranchesNodeId,
      );

      const defaultNodeIndex = nodeData.defaultBranchNodeId
        ? nodes.findIndex((node) => node.id === nodeData.defaultBranchNodeId)
        : -1;
      const mergeNodeIndex = nodes.findIndex((node) => node.id === nodeData.mergeBranchesNodeId);
      const insertAt =
        !isDefault && defaultNodeIndex !== -1
          ? defaultNodeIndex + 1
          : mergeNodeIndex !== -1
            ? mergeNodeIndex
            : nodes.length;

      let updatedNodes = [...nodes.slice(0, insertAt), ...newNodes, ...nodes.slice(insertAt)];

      // Safely and immutably map the updated branches array into the source node
      updatedNodes = updatedNodes.map((node) => {
        if (node.id === sourceNode.id) {
          const currentBranches = (node.data.branches || []) as string[];
          return {
            ...node,
            data: {
              ...node.data,
              ...(isDefault
                ? {
                    branches: [...currentBranches, newBranchStartNode.id],
                    defaultBranchNodeId: newBranchStartNode.id,
                    conditional2DefaultBranchEdgeId: newEdges[0].id,
                  }
                : nodeData.defaultBranchNodeId
                  ? {
                      branches: [
                        ...currentBranches.slice(0, currentBranches.length - 1),
                        newBranchStartNode.id,
                        currentBranches[currentBranches.length - 1],
                      ],
                    }
                  : { branches: [...currentBranches, newBranchStartNode.id] }),
            },
          };
        }
        return node;
      });

      const stepEdgeIndex = nodeData.conditional2DefaultBranchEdgeId
        ? edges.findIndex((edge) => edge.id === nodeData.conditional2DefaultBranchEdgeId)
        : -1;

      const updatedEdges =
        !isDefault && stepEdgeIndex !== -1
          ? [...edges.slice(0, stepEdgeIndex), ...newEdges, ...edges.slice(stepEdgeIndex)]
          : [...edges, ...newEdges];

      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setTimeout(() => {
        autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
      }, 100);
    },
    [autoLayout],
  );

  return addConditionalBranch;
};
