// ─── useGroupToggle ──────────────────────────────────────────────────────────
import { MARKER_ARROW_PREFIX } from "@/constants";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";

import { toast } from "@aventisia/ui/sonner";
import { Edge } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { getIntermediateNodeIds } from "../utils/getIntermediateNodes";
import { areNodesConnected } from "../utils/getNodesConnectivity";
import { syncModelNodeVisibility } from "./useGroupToggle";

// ─── useNodeGrouping ──────────────────────────────────────────────────────────

export function useNodeGrouping() {
  const { selectedNode, setMenu, setSelectedNode, setSelectedEdge } =
    useContextMenuActionsStore(
      useShallow((state) => ({
        selectedNode: state.selectedNode,
        setMenu: state.setMenu,
        setSelectedNode: state.setSelectedNode,
        setSelectedEdge: state.setSelectedEdge,
      })),
    );

  const autoLayout = useDagreAutoLayout();

  const resetContextMenu = () => {
    setMenu(null);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
      edges: state.edges,
      setEdges: state.setEdges,
    })),
  );

  const { selectedNodes } = useTrackSelectionStore(
    useShallow((state) => ({
      selectedNodes: state.selectedNodes,
    })),
  );

  const groupNodes = () => {
    if (selectedNodes.length < 1) return;

    const expandedNodeIds = new Set<string>();

    if (
      selectedNodes.length === 1 &&
      selectedNodes[0]?.data?.mergeBranchesNodeId
    ) {
      const branchSubgraph = getIntermediateNodeIds(
        nodes,
        edges,
        selectedNodes[0].id,
      );
      branchSubgraph.forEach((id) => expandedNodeIds.add(id));
    } else {
      selectedNodes.forEach((node) => {
        if (node?.data?.mergeBranchesNodeId) {
          const branchSubgraph = getIntermediateNodeIds(nodes, edges, node.id);
          branchSubgraph.forEach((id) => expandedNodeIds.add(id));
        } else {
          expandedNodeIds.add(node.id);
        }
      });
    }

    const fullSelectedNodes = nodes.filter((n) => expandedNodeIds.has(n.id));

    const alreadyGrouped = fullSelectedNodes.some(
      (node) => !!node.data?.groupId,
    );
    if (alreadyGrouped) {
      toast.warning(
        "One or more selected nodes are already part of another group.",
      );
      return;
    }

    const hasBlock = fullSelectedNodes.some(
      (node) => node.type === "blockNode",
    );

    const isValidGroup = areNodesConnected(fullSelectedNodes, edges);
    if (!isValidGroup) {
      toast.warning("Selected nodes are not continuos in order.");
      return;
    }

    const groupMembers = fullSelectedNodes.slice(1);
    const groupId = `group-${Date.now()}`;
    const groupedNodeIds = fullSelectedNodes.map((n) => n.id);

    const groupFirstNode = fullSelectedNodes.find(
      (node) =>
        !edges.some(
          (edge) =>
            groupedNodeIds.includes(edge.source) && edge.target === node.id,
        ),
    );
    const groupLastNode = fullSelectedNodes.find(
      (node) =>
        !edges.some(
          (edge) =>
            edge.source === node.id && groupedNodeIds.includes(edge.target),
        ),
    );

    const groupHead = groupFirstNode ?? fullSelectedNodes[0];
    const lastNode =
      groupLastNode ?? fullSelectedNodes[fullSelectedNodes.length - 1];

    const outgoingEdge = edges.find(
      (e) => e.source === lastNode.id && !groupedNodeIds.includes(e.target),
    );

    const tempEdge: Edge = {
      id: `temp-${groupId}-${outgoingEdge?.target}`,
      source: groupHead.id,
      target: outgoingEdge?.target as string,
      markerEnd: `${MARKER_ARROW_PREFIX}temp-${groupId}-${outgoingEdge?.target}`,
      deletable: true,
      label: "plus",
      data: {
        isTemporary: true,
        originalSource: outgoingEdge?.source,
        originalTarget: outgoingEdge?.target,
        groupId,
      },
    };

    let updatedNodes = nodes.map((node) => {
      if (node.id === groupHead.id) {
        return {
          ...node,
          data: {
            ...node.data,
            groupId,
            hasBlock,
            count: selectedNodes.length,
            isGroupHead: true,
            isExpanded: false,
          },
        };
      }
      if (groupMembers.some((m) => m.id === node.id)) {
        return {
          ...node,
          hidden: true,
          data: { ...node.data, groupId },
        };
      }
      return node;
    });

    // Sync modelNode visibility — any aiNode that became hidden as a group member
    // should also hide its modelNode
    updatedNodes = syncModelNodeVisibility(updatedNodes);

    const finalEdges = tempEdge ? [...edges, tempEdge] : [...edges];
    autoLayout({ newNodes: updatedNodes, newEdges: finalEdges });
    resetContextMenu();
  };

  const ungroupNodes = () => {
    if (!selectedNode?.data?.groupId) return;

    const groupId = selectedNode.data.groupId as string;
    const keysToRemove = ["groupId", "isGroupHead", "isExpanded", "count"];

    let updatedNodes = nodes.map((node) => {
      if (node?.data?.groupId === groupId) {
        return {
          ...node,
          hidden: false,
          data: Object.fromEntries(
            Object.entries(node.data).filter(
              ([key]) => !keysToRemove.includes(key),
            ),
          ),
        };
      }
      return node;
    });

    // After all group nodes are made visible again, sync modelNodes
    updatedNodes = syncModelNodeVisibility(updatedNodes);

    const updatedEdges = edges.filter(
      (edge) => !(edge.data?.isTemporary && edge.id.includes(groupId)),
    );

    autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
    resetContextMenu();
  };

  return { groupNodes, ungroupNodes };
}
