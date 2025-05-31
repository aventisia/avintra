import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDagreAutoLayout } from "./useDagreAutoLayout";
import { createNewConditionalBranch } from "@/utils/create-nodes/create-new-conditional-branch";
import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";

export const useAddConditionalBranch = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  // Handler to add first node to flow
  const addConditionalBranch = useCallback(
    (nodeData: ConditionalNodeDataType, switchNodeId: string) => {
      // Get source node
      const sourceNode = nodes.find((node) => node.id === switchNodeId);
      if (!sourceNode) return;

      // Create new node & edge
      const { newNodes, newEdges } = createNewConditionalBranch(
        nodeData.branchesCount,
        sourceNode,
        nodeData.mergeBranchesNodeId,
      );

      // Get default branch start node index
      const sourceNodeIndex = nodes.findIndex(
        (node) => node.id === nodeData.defaultBranchNodeId,
      );

      // Add new swithc case branch nodes before default case branch start node
      const updatedNodes = [
        ...nodes.slice(0, sourceNodeIndex + 1),
        ...newNodes,
        ...nodes.slice(sourceNodeIndex + 1),
      ];

      // Get step edge index
      const stepEdgeIndex = edges.findIndex(
        (edge) => edge.id === nodeData.conditional2DefaultBranchEdgeId,
      );

      // Add new edges before step edge
      const updatedEdges = [
        ...edges.slice(0, stepEdgeIndex),
        ...newEdges,
        ...edges.slice(stepEdgeIndex),
      ];

      // Mapp through updatedNodes and update the branches count of the source node
      updatedNodes.forEach((node) => {
        if (node.id === sourceNode.id) {
          node.data.branchesCount = nodeData.branchesCount + 1; // Increment branches count
        }
      });
      
      // Auto organize node & edge
      autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
    },
    [edges, nodes, autoLayout],
  );

  // Return the handler
  return addConditionalBranch;
};
