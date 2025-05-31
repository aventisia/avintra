import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { createNodesAndEdgesUtil } from "@/utils/create-node-and-edges-util";
import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDagreAutoLayout } from "./useDagreAutoLayout";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";

export const useAddNodeFromEdge = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, setShowDialog, setNodeData, setNodeId } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        showDialog: state.showDialog,
        setNodeId: state.setNodeId,
        setShowDialog: state.setShowDialog,
        setNodeData: state.setNodeData,
      })),
    );

  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  // Handler to add new node from plus label of step edge
  const addNodeFromEdge = useCallback(
    (nodeData: NodeDataType, stepEdgeId: string) => {
      // Get step edge
      const stepEdge = edges.find((edge) => edge.id === stepEdgeId) as Edge;

      // Get source node
      const sourceNode = nodes.find((node) => node.id === stepEdge.source);
      if (!sourceNode) return;

      // Create new node & edge
      const { newNodes, newEdges, lastNode } = createNodesAndEdgesUtil(
        sourceNode,
        nodeData,
      );

      // Get source node index
      const sourceNodeIndex = nodes.findIndex(
        (node) => node.id === stepEdge.source,
      );

      // Add new nodes after source node
      const updatedNodes = [
        ...nodes.slice(0, sourceNodeIndex + 1),
        ...newNodes,
        ...nodes.slice(sourceNodeIndex + 1),
      ];

      // Update step edge source to new node
      const updatedEdges1 = edges.map((edge) =>
        edge.id === stepEdgeId
          ? {
              ...edge,
              source: lastNode.id,
            }
          : edge,
      );

      // Get step edge index
      const stepEdgeIndex = updatedEdges1.findIndex(
        (edge) => edge.id === stepEdgeId,
      );

      // Add new edges before step edge
      const updatedEdges2 = [
        ...updatedEdges1.slice(0, stepEdgeIndex),
        ...newEdges,
        ...updatedEdges1.slice(stepEdgeIndex),
      ];

      // Open Config dialog when new node added
      setNodeData(nodeData);
      setShowDialog(!showDialog);
      setNodeId(lastNode.id);

      // Auto organize node & edge
      autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges2 });
    },
    [
      edges,
      nodes,
      setNodeData,
      setShowDialog,
      showDialog,
      setNodeId,
      autoLayout,
    ],
  );

  // Return the handler
  return addNodeFromEdge;
};
