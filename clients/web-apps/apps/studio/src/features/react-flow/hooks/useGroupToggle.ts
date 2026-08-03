// ─── useGroupToggle ──────────────────────────────────────────────────────────
import { Edge, Node } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { MARKER_ARROW_PREFIX } from "@/constants";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

// ─── Shared helper ────────────────────────────────────────────────────────────
//
// modelNode visibility must always match its parent aiNode's hidden state.
// modelNode is not part of the group system — its position and visibility
// are purely relative to its parent aiNode. This helper syncs them after
// any operation that may change aiNode visibility.
//
// Uses parentId as the canonical aiNode → modelNode link.

export const syncModelNodeVisibility = (nodes: Node[]): Node[] => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return nodes.map((n) => {
    if (n.type !== "modelNode" || !n.parentId) return n;
    const parent = nodeMap.get(n.parentId);
    if (!parent || parent.hidden === n.hidden) return n;
    return { ...n, hidden: parent.hidden ?? false };
  });
};

// ─── useGroupToggle ───────────────────────────────────────────────────────────

export function useGroupToggle() {
  const { nodes, edges, setNodes, setEdges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  );

  const autoLayout = useDagreAutoLayout();
  const [pendingLayoutTrigger, setPendingLayoutTrigger] = useState(false);
  const layoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleGroupExpand = (groupId: string) => {
    const groupHead = nodes.find((n) => n.data?.groupId === groupId && n.data?.isGroupHead);
    if (!groupHead) return;

    const isCurrentlyExpanded = groupHead.data?.isExpanded ?? false;

    const groupNodes = nodes.filter((n) => n.data?.groupId === groupId);
    const groupNodeIds = groupNodes.map((n) => n.id);

    const groupLastNode = groupNodes.find(
      (node) =>
        !edges.some((edge) => edge.source === node.id && groupNodeIds.includes(edge.target)),
    );
    const lastNode = groupLastNode ?? groupNodes[groupNodes.length - 1];

    let updatedNodes: Node[];
    let updatedEdges: Edge[];

    if (!isCurrentlyExpanded) {
      // EXPAND
      updatedNodes = nodes.map((node) => {
        if (node.data?.groupId === groupId) {
          return {
            ...node,
            hidden: false,
            data: { ...node.data, isExpanded: true },
          };
        }
        return node;
      });
      updatedEdges = edges.filter((e) => !(e.data?.isTemporary && e.id.includes(groupId)));
    } else {
      // COLLAPSE
      updatedNodes = nodes.map((node) => {
        if (node.id === groupHead.id) {
          return { ...node, data: { ...node.data, isExpanded: false } };
        }
        if (node.data?.groupId === groupId && !node.data?.isGroupHead) {
          return { ...node, hidden: true };
        }
        return node;
      });

      const outgoingEdge = edges.find(
        (e) => e.source === lastNode.id && !groupNodeIds.includes(e.target),
      );
      const tempEdge: Edge | null = outgoingEdge
        ? {
            id: `temp-${groupId}-${outgoingEdge.target}`,
            source: groupHead.id,
            target: outgoingEdge.target,
            markerEnd: `${MARKER_ARROW_PREFIX}temp-${groupId}-${outgoingEdge.target}`,
            deletable: true,
            label: "plus",
            data: {
              isTemporary: true,
              originalSource: outgoingEdge.source,
              originalTarget: outgoingEdge.target,
              groupId,
            },
          }
        : null;

      const cleanedEdges = edges.filter((e) => !(e.data?.isTemporary && e.id.includes(groupId)));
      updatedEdges = tempEdge ? [...cleanedEdges, tempEdge] : cleanedEdges;
    }

    // Sync modelNode visibility to match its parent aiNode after any hidden state changes
    updatedNodes = syncModelNodeVisibility(updatedNodes);

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setPendingLayoutTrigger(true);
  };

  useEffect(() => {
    if (!pendingLayoutTrigger) return;
    layoutTimeoutRef.current = setTimeout(() => {
      autoLayout();
      setPendingLayoutTrigger(false);
    }, 50);
    return () => {
      if (layoutTimeoutRef.current) {
        clearTimeout(layoutTimeoutRef.current);
        layoutTimeoutRef.current = null;
      }
    };
  }, [pendingLayoutTrigger, autoLayout]);

  return { toggleGroupExpand };
}
