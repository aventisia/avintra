import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Edge, Node } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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
    const groupHead = nodes.find(
      (n) => n.data?.groupId === groupId && n.data?.isGroupHead,
    );
    if (!groupHead) return;

    const isCurrentlyExpanded = groupHead.data?.isExpanded ?? false;

    // Get all nodes in the group
    const groupNodes = nodes.filter((n) => n.data?.groupId === groupId);

    let updatedNodes: Node[] = [];
    let updatedEdges: Edge[] = [];

    if (!isCurrentlyExpanded) {
      // --- EXPAND ---

      // Show nodes
      updatedNodes = nodes.map((node) => {
        if (node.data?.groupId === groupId) {
          return {
            ...node,
            hidden: false,
            data: {
              ...node.data,
              isExpanded: true,
            },
          };
        }
        return node;
      });

      // Remove temporary edges (the bypass ones)
      const nonTempEdges = edges.filter(
        (e) => !(e.data?.isTemporary && e.id.includes(groupId)),
      );

      // Restore the original edges for this group
      const restoredEdges = (groupHead.data.originalEdges || []) as Edge[];

      updatedEdges = [...nonTempEdges, ...restoredEdges];
    } else {
      // --- COLLAPSE ---

      // Hide group members (leave head visible)
      updatedNodes = nodes.map((node) => {
        if (node.id === groupHead.id) {
          return {
            ...node,
            data: {
              ...node.data,
              isExpanded: false,
            },
          };
        }
        if (node.data?.groupId === groupId) {
          return {
            ...node,
            hidden: true,
          };
        }
        return node;
      });

      // Remove internal edges and reintroduce bypass edges
      const groupNodeIds = groupNodes.map((n) => n.id);
      const originalEdges = (groupHead.data.originalEdges || []) as Edge[];

      const restoredTempEdges: Edge[] = [];

      for (const edge of originalEdges) {
        const isSourceInGroup = groupNodeIds.includes(edge.source);
        const isTargetInGroup = groupNodeIds.includes(edge.target);

        if (isSourceInGroup && !isTargetInGroup) {
          restoredTempEdges.push({
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
          restoredTempEdges.push({
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
      }

      const remainingEdges = edges.filter(
        (e) => !originalEdges.some((orig) => orig.id === e.id),
      );

      updatedEdges = [...remainingEdges, ...restoredTempEdges];
    }

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
  return {
    toggleGroupExpand,
  };
}
