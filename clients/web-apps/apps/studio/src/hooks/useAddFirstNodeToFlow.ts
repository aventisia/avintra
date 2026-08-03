import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { createNodesAndEdgesUtil } from "@/utils/create-node-and-edges-util";

import { useDagreAutoLayout } from "./useDagreAutoLayout";

export const useAddFirstNodeToFlow = () => {
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
  const addFirstNodeToFlow = useCallback(
    (nodeData: NodeDataType, plusNodeId: string) => {
      // Get plus node edge
      const plusNodeEdge = edges.find((edge) => edge.target === plusNodeId) as Edge;

      // Get source node
      const sourceNode = nodes.find((node) => node.id === plusNodeEdge.source);
      if (!sourceNode) return;

      // Create first node & edge
      const {
        newNodes: firstNode,
        newEdges: firstEdge,
        lastNode: firstNodeArrayLastNode,
      } = createNodesAndEdgesUtil(sourceNode, nodeData);

      // Create flow end node & edge
      const { newNodes: flowEndNode, newEdges: flowEndEdge } = createNodesAndEdgesUtil(
        firstNodeArrayLastNode,
        nodeData, // Not required for flow end node but added because its a required parameter
        "flowEndNode",
      );

      // Get plus node index
      const plusNodeIndex = nodes.findIndex((node) => node.id === plusNodeId);

      // Add new nodes & remove plus node
      const updatedNodes = [
        ...nodes.slice(0, plusNodeIndex),
        ...firstNode,
        ...flowEndNode,
        ...nodes.slice(plusNodeIndex + 1),
      ];

      // Get plus node edge index
      const plusNodeEdgeIndex = edges.findIndex((edge) => edge.id === plusNodeEdge.id);

      // Add new edges & remove plus node edge
      const updatedEdges = [
        ...edges.slice(0, plusNodeEdgeIndex),
        ...firstEdge,
        ...flowEndEdge,
        ...edges.slice(plusNodeEdgeIndex + 1),
      ];

      // Auto organize node & edge
      autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
    },
    [edges, nodes, autoLayout],
  );

  // Return the handler
  return addFirstNodeToFlow;
};
