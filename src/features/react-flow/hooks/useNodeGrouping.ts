import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { useShallow } from "zustand/react/shallow";
import { getIntermediateNodeIds } from "../utils/getIntermediateNodes";
import { areNodesConnected } from "../utils/getNodesConnectivity";
import { toast } from "@aventisia/ui/sonner";
import { Edge } from "@xyflow/react";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";

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
    const groupHead = fullSelectedNodes[0];
    const groupMembers = fullSelectedNodes.slice(1);

    const groupId = `group-${Date.now()}`;

    // Store original edges (full edge objects)
    const originalEdges = edges.filter((edge) =>
      fullSelectedNodes.some(
        (node) => node.id === edge.source || node.id === edge.target,
      ),
    );

    // Update nodes
    const updatedNodes = nodes.map((node) => {
      if (node.id === groupHead.id) {
        return {
          ...node,
          data: {
            ...node.data,
            groupId,
            isGroupHead: true,
            isExpanded: false,
            originalEdges, // full edge data
          },
        };
      }
      if (groupMembers.some((member) => member.id === node.id)) {
        return {
          ...node,
          hidden: true,
          data: {
            ...node.data,
            groupId,
          },
        };
      }
      return node;
    });

    // Remove edges connected to grouped nodes
    const edgesToRemove = edges.filter((edge) =>
      fullSelectedNodes.some(
        (node) => node.id === edge.source || node.id === edge.target,
      ),
    );

    // Create temporary "bypass" edges
    const temporaryEdges: Edge[] = [];

    edgesToRemove.forEach((edge) => {
      const isSourceInGroup = fullSelectedNodes.some(
        (node) => node.id === edge.source,
      );
      const isTargetInGroup = fullSelectedNodes.some(
        (node) => node.id === edge.target,
      );

      if (isSourceInGroup && !isTargetInGroup) {
        temporaryEdges.push({
          id: `temp-${groupId}-${edge.target}`,
          source: groupHead.id,
          target: edge.target,
          deletable: true,
          label: "plus",
          data: {
            isTemporary: true,
            originalSource: edge.source,
            originalTarget: edge.target,
          },
        });
      } else if (!isSourceInGroup && isTargetInGroup) {
        temporaryEdges.push({
          id: `temp-${edge.source}-${groupId}`,
          source: edge.source,
          target: groupHead.id,
          deletable: true,
          label: "plus",
          data: {
            isTemporary: true,
            originalSource: edge.source,
            originalTarget: edge.target,
          },
        });
      }
    });

    const finalEdges = [
      ...edges.filter((e) => !edgesToRemove.includes(e)),
      ...temporaryEdges,
    ];

    setNodes(updatedNodes);
    setEdges(finalEdges);
  };

  const ungroupNodes = () => {
    if (!selectedNode?.data?.groupId) return;

    const groupId = selectedNode.data.groupId as string;

    // Get all nodes in this group
    const groupedNodes = nodes.filter(
      (node) => node?.data?.groupId === groupId,
    );

    const groupHead = groupedNodes.find((node) => node.data.isGroupHead);
    if (!groupHead) return;

    const restoredOriginalEdges: Edge[] = (groupHead.data.originalEdges ||
      []) as Edge[];

    const updatedNodes = nodes.map((node) => {
      if (node?.data?.groupId === groupId) {
        return {
          ...node,
          hidden: false,
          data: {
            ...node.data,
            groupId: undefined,
            isGroupHead: undefined,
            originalEdges: undefined,
          },
        };
      }
      return node;
    });

    // Remove temp edges for this group
    const nonTempEdges = edges.filter(
      (edge) => !edge?.data?.isTemporary || !edge.id.includes(groupId),
    );

    const finalEdges = [...nonTempEdges, ...restoredOriginalEdges];

    setNodes(updatedNodes);
    setEdges(finalEdges);
  };
  return { groupNodes, ungroupNodes };
}
