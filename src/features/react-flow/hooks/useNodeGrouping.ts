import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { useShallow } from "zustand/react/shallow";
import { getIntermediateNodeIds } from "../utils/getIntermediateNodes";
import { areNodesConnected } from "../utils/getNodesConnectivity";
import { toast } from "@aventisia/ui/sonner";
import { Edge } from "@xyflow/react";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { MARKER_ARROW_PREFIX } from "@/constants";

export function useNodeGrouping() {
  const { selectedNode } = useContextMenuActionsStore();

  // Get ReactFlowExt store state & actions
  const { nodes, edges, setNodes, setEdges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
      edges: state.edges,
      setEdges: state.setEdges,
    })),
  );

  // Get TrackSelection store state & actions
  const { selectedNodes } = useTrackSelectionStore(
    useShallow((state) => ({
      selectedNodes: state.selectedNodes,
    })),
  );

  const groupNodes = () => {
    if (selectedNodes.length < 1) return;

    const expandedNodeIds = new Set<string>();

    // --- If selected only a conditional/loop node, auto-expand to its full flow ---
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
      // Expand any branching node in selection to include its full flow
      selectedNodes.forEach((node) => {
        if (node?.data?.mergeBranchesNodeId) {
          const branchSubgraph = getIntermediateNodeIds(nodes, edges, node.id);
          branchSubgraph.forEach((id) => expandedNodeIds.add(id));
        } else {
          expandedNodeIds.add(node.id);
        }
      });
    }

    // Get full list of nodes involved in this group
    const fullSelectedNodes = nodes.filter((n) => expandedNodeIds.has(n.id));

    // ✅ PRE-CHECK: Ensure none of the nodes are already grouped
    const alreadyGrouped = fullSelectedNodes.some(
      (node) => !!node.data?.groupId,
    );

    const hasBlock = fullSelectedNodes.some((node) => node.type == "blockNode");

    if (alreadyGrouped) {
      toast.warning(
        "One or more selected nodes are already part of another group.",
      );
      return;
    }

    // ✅ PRE-CHECK: Ensure selected nodes are connected
    const isValidGroup = areNodesConnected(fullSelectedNodes, edges);
    if (!isValidGroup) {
      toast.warning("Selected nodes are not continuos in order.");
      return;
    }
    const lightBgColors = [
      "border-orange-300",
      "border-green-300",
      "border-yellow-300",
      "border-pink-300",
    ];

    const groupHead = fullSelectedNodes[0];
    const groupMembers = fullSelectedNodes.slice(1);

    const groupId = `group-${Date.now()}`;

    const groupedNodeIds = fullSelectedNodes.map((n) => n.id);
    const lastNode = fullSelectedNodes[fullSelectedNodes.length - 1];

    // Find the next connected node *outside* the group (if any)
    const outgoingEdge = edges.find(
      (e) => e.source === lastNode.id && !groupedNodeIds.includes(e.target),
    );

    const tempEdge: Edge | null = outgoingEdge
      ? {
          id: `temp-${groupId}-${outgoingEdge.target}`,
          source: groupHead.id,
          target: outgoingEdge.target,
          markerEnd: `${MARKER_ARROW_PREFIX}temp-${groupId}-${outgoingEdge.target}`,
          deletable: true,
          // label: "plus",
          data: {
            isTemporary: true,
            originalSource: outgoingEdge.source,
            originalTarget: outgoingEdge.target,
          },
        }
      : null;

    const color = lightBgColors[Math.floor(Math.random() * 4)];
    const updatedNodes = nodes.map((node) => {
      if (node.id === groupHead.id) {
        return {
          ...node,
          data: {
            ...node.data,
            groupId,
            hasBlock,
            count: selectedNodes.length,
            color,
            isGroupHead: true,
            isExpanded: false,
          },
        };
      }
      if (groupMembers.some((m) => m.id === node.id)) {
        return {
          ...node,
          hidden: true,
          data: {
            ...node.data,
            color,
            groupId,
          },
        };
      }
      return node;
    });

    const finalEdges = tempEdge ? [...edges, tempEdge] : [...edges];

    setNodes(updatedNodes);
    setEdges(finalEdges);
  };

  const ungroupNodes = () => {
    if (!selectedNode?.data?.groupId) return;

    const groupId = selectedNode.data.groupId as string;

    const keysToRemove = [
      "groupId",
      "isGroupHead",
      "isExpanded",
      "count",
      "color",
    ];

    const updatedNodes = nodes.map((node) => {
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

    const updatedEdges = edges.filter(
      (edge) => !(edge.data?.isTemporary && edge.id.includes(groupId)),
    );

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };
  return { groupNodes, ungroupNodes };
}
