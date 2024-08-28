import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { createNodesAndEdgesUtil } from "@/utils/create-node-and-edges-util";
import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDagreAutoLayout } from "./useDagreAutoLayout";

export const useAddFirstNodeToBranch = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Auto layout the flow
  const { autoLayoutOnAdd } = useDagreAutoLayout();

  // Handler to add first node to branch
  const addFirstNodeToBranch = useCallback(
    (nodeData: NodeDataType, plusNodeId: string) => {
      // Get branch start node edge
      const branchStartNodeEdge = edges.find(
        (edge) => edge.target === plusNodeId,
      ) as Edge;

      // Get branch end node edge
      const branchEndNodeEdge = edges.find(
        (edge) => edge.source === plusNodeId,
      ) as Edge;

      // Create new node & edge
      const { newNodes, newEdges, lastNodeId } = createNodesAndEdgesUtil(
        nodeData,
        branchStartNodeEdge.source,
      );

      // Create edge from last node to branch end node
      const lastNodeToBranchEndEdge = createPlusEdgeObj(
        lastNodeId,
        branchEndNodeEdge.target,
      );

      // Get plus node index
      const plusNodeIndex = nodes.findIndex(
        (node) => node.id === plusNodeId,
      );

      // Add new nodes & remove plus node
      const updatedNodes = [
        ...nodes.slice(0, plusNodeIndex),
        ...newNodes,
        ...nodes.slice(plusNodeIndex + 1),
      ];

      // Get branch start node edge index
      const branchStartNodeEdgeIndex = edges.findIndex(
        (edge) => edge.id === branchStartNodeEdge.id,
      );

      // Add branch start new edge & remove old one
      const updatedEdges1 = [
        ...edges.slice(0, branchStartNodeEdgeIndex),
        ...newEdges,
        ...edges.slice(branchStartNodeEdgeIndex + 1),
      ];

      // Get branch end node edge index
      const branchEndNodeEdgeIndex = edges.findIndex(
        (edge) => edge.id === branchEndNodeEdge.id,
      );

      // Add branch start new edge & remove old one
      const updatedEdges = [
        ...updatedEdges1.slice(0, branchEndNodeEdgeIndex),
        lastNodeToBranchEndEdge,
        ...updatedEdges1.slice(branchEndNodeEdgeIndex + 1),
      ];

      // Auto organize node & edge
      autoLayoutOnAdd(updatedNodes, updatedEdges);
    },
    [edges, nodes, autoLayoutOnAdd],
  );

  // Return the handler
  return addFirstNodeToBranch;
};
