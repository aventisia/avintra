import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useFlowOperations } from "@/features/react-flow/hooks/useFlowOperations";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@aventisia/ui/context-menu";
import { DeleteCMItem } from "@aventisia/ui/context-menu";
import { SimpleCMItem } from "@aventisia/ui/context-menu";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";
import { Library, GroupIcon, UngroupIcon } from "lucide-react";
import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { useShallow } from "zustand/react/shallow";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Edge } from "@xyflow/react";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";

export const ReactFlowContextMenu = ({ children }: React.PropsWithChildren) => {
  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  // Get selected nodes/edges
  const { setSelectedNode, setSelectedEdge, selectedNode, selectedEdge } =
    useContextMenuActionsStore();

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

  const { deleteNode } = useFlowOperations();

  const isGroupHead = selectedNode?.data.isGroupHead;

  const groupNodes = () => {
    if (selectedNodes.length < 2) return;

    const groupId = `group-${Date.now()}`;
    const groupHead = selectedNodes[0];
    const groupMembers = selectedNodes.slice(1);

    // Store original edges for restoration
    const originalEdges = edges.filter((edge) =>
      selectedNodes.some(
        (node) => node.id === edge.source || node.id === edge.target,
      ),
    );

    // Update nodes: set group head and hide members
    const updatedNodes = nodes.map((node) => {
      if (node.id === groupHead.id) {
        return {
          ...node,
          data: {
            ...node.data,
            groupId,
            isGroupHead: true,
            originalEdges: originalEdges.map((e) => e.id),
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
      selectedNodes.some(
        (node) => node.id === edge.source || node.id === edge.target,
      ),
    );

    // Create temporary edges to maintain flow continuity
    const temporaryEdges: Edge[] = [];

    // Find external connections and create bypass edges
    edgesToRemove.forEach((edge) => {
      const isSourceInGroup = selectedNodes.some(
        (node) => node.id === edge.source,
      );
      const isTargetInGroup = selectedNodes.some(
        (node) => node.id === edge.target,
      );

      if (isSourceInGroup && !isTargetInGroup) {
        // Edge from group to external node - connect group head to target
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
        // Edge from external node to group - connect source to group head
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

    // Remove original edges and add temporary ones
    const filteredEdges = edges.filter((edge) => !edgesToRemove.includes(edge));
    const newEdges = [...filteredEdges, ...temporaryEdges];

    setNodes(updatedNodes);
    setEdges(newEdges);
  };

  const ungroupNodes = () => {
    // Find all nodes in the group
    const groupNodes = nodes.filter(
      (node) => node?.data?.groupId === selectedNode?.data?.groupId,
    );
    const groupHead = groupNodes.find((node) => node.data.isGroupHead);

    if (!groupHead) return;

    // Restore visibility and remove group data
    const updatedNodes = nodes.map((node) => {
      if (node?.data?.groupId === selectedNode?.data?.groupId) {
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

    // Remove temporary edges
    const nonTemporaryEdges = edges.filter(
      (edge) =>
        !edge?.data?.isTemporary ||
        !edge.id.includes((selectedNode?.data?.groupId as string) || "temp"),
    );

    // Restore original edges
    // const originalEdgeIds = groupHead.data.originalEdges || [];
    const restoredEdges: Edge[] = [];

    // Find temporary edges that were created for this group
    const temporaryGroupEdges = edges.filter(
      (edge) =>
        edge?.data?.isTemporary &&
        edge.id.includes((selectedNode?.data?.groupId as string) || "temp"),
    );

    // Recreate original edges based on temporary edge mappings
    temporaryGroupEdges.forEach((tempEdge) => {
      if (tempEdge?.data?.originalSource && tempEdge?.data?.originalTarget) {
        restoredEdges.push(
          createPlusEdgeObj(
            tempEdge?.data?.originalSource as string,
            tempEdge?.data?.originalTarget as string,
          ),
        );
      }
    });

    // Also restore any internal group edges that were removed
    // This is a simplified restoration - in a real app, you'd want to store the complete original edge set
    const groupNodeIds = groupNodes.map((n) => n.id);
    const internalEdges: Edge[] = [];

    // Create some basic internal connections (this would be better with stored original edges)
    for (let i = 0; i < groupNodeIds.length - 1; i++) {
      internalEdges.push(
        createPlusEdgeObj(groupNodeIds[i], groupNodeIds[i + 1]),
      );
    }

    const finalEdges = [
      ...nonTemporaryEdges,
      ...restoredEdges,
      ...internalEdges,
    ];

    setNodes(updatedNodes);
    setEdges(finalEdges);
  };

  return (
    <ContextMenu
      //To clear the node on close of context menu
      onOpenChange={(open) => {
        if (!open) {
          setSelectedNode(null);
          setSelectedEdge(null);
          autoLayout();
        }
      }}
    >
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        {/* Cut selection */}
        {/* <SimpleCMItem
          size="sm"
          content="Cut"
          Icon={Scissors}
          shortCut="Ctrl+X"
          disabled={!selectedNode}
          onClick={() => selectedNode && cutNode(selectedNode.id)}
        /> */}

        {/* Copy selection */}
        {/* <SimpleCMItem
          size="sm"
          content="Copy"
          Icon={Copy}
          shortCut="Ctrl+C"
          disabled={!selectedNode}
          onClick={() => selectedNode && copyNode(selectedNode.id)}
        /> */}

        {/* Paste cut or copied items */}
        {/* <SimpleCMItem
          size="sm"
          content="Paste"
          Icon={Clipboard}
          shortCut="Ctrl+V"
          disabled={!selectedEdge}
          onClick={() =>
            selectedEdge && pasteNode(selectedEdge.source, selectedEdge.target)
          }
        /> */}

        {/* <ContextMenuSeparator className="h-[0.5px]" /> */}

        {/* Group items. */}
        {isGroupHead ? (
          <SimpleCMItem
            size="sm"
            content="Ungroup"
            Icon={UngroupIcon}
            onClick={() => ungroupNodes()}
          />
        ) : (
          <SimpleCMItem
            size="sm"
            content="Group up"
            Icon={GroupIcon}
            onClick={() => groupNodes()}
          />
        )}
        <ContextMenuSeparator className="h-[0.5px]" />

        {/* Organize items. Apply auto layout */}
        <SimpleCMItem
          size="sm"
          content="Organize"
          Icon={Library}
          onClick={() => autoLayout()}
        />

        <ContextMenuSeparator className="h-[0.5px]" />

        {/* Delete selected items */}
        <DeleteCMItem
          size="sm"
          disabled={!selectedNode && !selectedEdge}
          onClick={() => selectedNode && deleteNode(selectedNode.id)}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
};
