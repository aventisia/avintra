import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { createNodesAndEdgesUtil } from "@/utils/create-node-and-edges-util";
import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDagreAutoLayout } from "./useDagreAutoLayout";
import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { MARKER_ARROW_PREFIX } from "@/constants";

export const useAddNodeFromEdge = () => {
  // Get state and actions from the DynamicConfigPanel store
  const { setNodeId, setShowDialog, setNodeData } = useDynamicConfigPanelStore(
    useShallow((state) => ({
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
      // JIT State Fetching: Grab the absolute latest nodes and edges only when clicked
      const { nodes, edges } = useReactFlowExtStore.getState();

      const stepEdge = edges.find((edge) => edge.id === stepEdgeId) as Edge;
      if (!stepEdge) return;

      const isTempEdge = stepEdge?.data?.isTemporary;

      if (isTempEdge) {
        const realSourceId = stepEdge.data?.originalSource as string;
        const realTargetId = stepEdge.data?.originalTarget as string;
        const groupHeadId = stepEdge.source;

        const realSourceNode = nodes.find((n) => n.id === realSourceId);
        const realTargetNode = nodes.find((n) => n.id === realTargetId);
        const groupHeadNode = nodes.find((n) => n.id === groupHeadId);

        if (!realSourceNode || !realTargetNode || !groupHeadNode) return;

        // Create new node between realSource → realTarget
        const { newNodes, newEdges, lastNode } = createNodesAndEdgesUtil(
          realSourceNode,
          nodeData,
        );

        // Insert after the realSource (last node of group)
        const realSourceIndex = nodes.findIndex((n) => n.id === realSourceId);
        const updatedNodes = [
          ...nodes.slice(0, realSourceIndex + 1),
          ...newNodes,
          ...nodes.slice(realSourceIndex + 1),
        ];

        // Remove:
        // 1. Temp edge from groupHead → next
        // 2. Real edge from last-in-group → next
        const cleanedEdges = edges.filter((e) => {
          const isOriginalEdgeToNext =
            e.source === realSourceId &&
            e.target === realTargetId &&
            !e.data?.isTemporary;

          const isTriggeredTempEdge =
            e.id === stepEdgeId && e.data?.isTemporary;

          return !(isOriginalEdgeToNext || isTriggeredTempEdge);
        });

        // Add new edge from new node to real target
        const newToNextEdge: Edge = createPlusEdgeObj(
          lastNode.id,
          realTargetId,
        );

        // Add temp edge from group head to new node (collapsed view)
        const updatedTempEdge: Edge = {
          id: `temp-${groupHeadNode?.data?.groupId}-${lastNode.id}`,
          source: groupHeadId,
          target: lastNode.id,
          label: "plus",
          markerEnd: `${MARKER_ARROW_PREFIX}temp-${groupHeadNode?.data?.groupId}-${lastNode.id}`,
          deletable: true,
          data: {
            isTemporary: true,
            originalSource: groupHeadId,
            originalTarget: lastNode.id,
            groupId: groupHeadNode?.data?.groupId,
          },
        };

        const finalEdges = [
          ...cleanedEdges,
          ...newEdges,
          newToNextEdge,
          updatedTempEdge,
        ];

        // Show config panel
        setNodeData(nodeData);
        setShowDialog(true);
        setNodeId(lastNode.id);

        autoLayout({ newNodes: updatedNodes, newEdges: finalEdges });
        return;
      }

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
      setShowDialog(true);
      setNodeId(lastNode.id);

      // Auto organize node & edge
      autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges2 });
    },
    [setNodeData, setShowDialog, setNodeId, autoLayout],
  );

  // Return the handler
  return addNodeFromEdge;
};
