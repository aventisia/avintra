import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { createNodesAndEdgesUtil } from "@/utils/create-node-and-edges-util";
import { createSupportNodeObj } from "@/utils/create-nodes/create-support-node-obj";
import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
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
      const plusNodeEdge = edges.find(
        (edge) => edge.target === plusNodeId,
      ) as Edge;

      // Create first node & edge
      const {
        newNodes: firstNode,
        newEdges: firstEdge,
        lastNodeId: firstNodeId,
      } = createNodesAndEdgesUtil(nodeData, plusNodeEdge.source);

      // Create flow end node & edge
      const flowEndNode = createSupportNodeObj("flowEndNode");
      const flowEndEdge = createPlusEdgeObj(firstNodeId, flowEndNode.id);

      // Get plus node index
      const plusNodeIndex = nodes.findIndex((node) => node.id === plusNodeId);

      // Add new nodes & remove plus node
      const updatedNodes = [
        ...nodes.slice(0, plusNodeIndex),
        ...firstNode,
        ...[flowEndNode],
        ...nodes.slice(plusNodeIndex + 1),
      ];

      // Get plus node edge index
      const plusNodeEdgeIndex = edges.findIndex(
        (edge) => edge.id === plusNodeEdge.id,
      );

      // Add new edges & remove plus node edge
      const updatedEdges = [
        ...edges.slice(0, plusNodeEdgeIndex),
        ...firstEdge,
        flowEndEdge,
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
