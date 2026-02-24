import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { createConditionalBranchNodeObj } from "@/utils/create-nodes/conditional/create-conditional-branch-node-obj";
import { createNewConditionalBranch } from "@/utils/create-nodes/create-new-conditional-branch";
import { useCallback } from "react";
import { useDagreAutoLayout } from "./useDagreAutoLayout";

export const useAddConditionalBranch = () => {
  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  // Handler to add first node to flow
  const addConditionalBranch = useCallback(
    (nodeData: ConditionalNodeDataType, switchNodeId: string) => {
      // JIT State Fetching: Get latest state instantly without subscribing
      const { nodes, edges } = useReactFlowExtStore.getState();

      const sourceNode = nodes.find((node) => node.id === switchNodeId);
      if (!sourceNode) return;

      // new branch start node
      const newBranchStartNode = createConditionalBranchNodeObj(
        `Branch ${nodeData.branches.length}`,
        false,
        nodeData.mergeBranchesNodeId,
      );

      // Create new node & edge
      const { newNodes, newEdges } = createNewConditionalBranch(
        sourceNode,
        newBranchStartNode,
        nodeData.mergeBranchesNodeId,
      );

      const sourceNodeIndex = nodes.findIndex(
        (node) => node.id === nodeData.defaultBranchNodeId,
      );

      let updatedNodes = [
        ...nodes.slice(0, sourceNodeIndex + 1),
        ...newNodes,
        ...nodes.slice(sourceNodeIndex + 1),
      ];

      // Safely and immutably map the updated branches array into the source node
      updatedNodes = updatedNodes.map((node) => {
        if (node.id === sourceNode.id) {
          const branches = (node.data.branches || []) as string[];
          return {
            ...node,
            data: {
              ...node.data,
              branches: [
                ...branches.slice(0, branches.length - 1),
                newBranchStartNode.id,
                branches[branches.length - 1],
              ],
            },
          };
        }
        return node;
      });

      const stepEdgeIndex = edges.findIndex(
        (edge) => edge.id === nodeData.conditional2DefaultBranchEdgeId,
      );

      const updatedEdges = [
        ...edges.slice(0, stepEdgeIndex),
        ...newEdges,
        ...edges.slice(stepEdgeIndex),
      ];

      autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
    },
    [autoLayout],
  );

  return addConditionalBranch;
};
