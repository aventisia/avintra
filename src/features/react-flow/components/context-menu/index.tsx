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
import { getIntermediateNodeIds } from "../../utils/getIntermediateNodes";
import { areNodesConnected } from "../../utils/getNodesConnectivity";
import { toast } from "@aventisia/ui/sonner";

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
