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

  // Assuming getIntermediateNodeIds is imported or available in this scope

  const groupNodes = () => {
    if (selectedNodes.length < 1) return;

    const groupId = `group-${Date.now()}`;
    const groupHead = selectedNodes[0];

    // --- EXPAND SELECTION TO INCLUDE CONDITIONAL/LOOP BRANCHES ---
    const additionalNodeIds = new Set<string>();

    selectedNodes.forEach((node) => {
      if (node?.data?.mergeBranchesNodeId) {
        // Branching node - include entire branch subgraph (including merge node)
        const branchSubgraph = getIntermediateNodeIds(nodes, edges, node.id);
        branchSubgraph.forEach((id) => additionalNodeIds.add(id));
      } else {
        // Regular node - just add itself
        additionalNodeIds.add(node.id);
      }
    });

    // Compose full selected nodes list including expanded branches
    const fullSelectedNodes = nodes.filter((n) => additionalNodeIds.has(n.id));
    const groupMembers = fullSelectedNodes.filter((n) => n.id !== groupHead.id);

    // --- STORE ORIGINAL EDGES CONNECTED TO ANY OF THE GROUPED NODES ---
    const originalEdges = edges.filter((edge) =>
      fullSelectedNodes.some(
        (node) => node.id === edge.source || node.id === edge.target,
      ),
    );

    // --- UPDATE NODES ---
    const updatedNodes = nodes.map((node) => {
      if (node.id === groupHead.id) {
        return {
          ...node,
          data: {
            ...node.data,
            groupId,
            isGroupHead: true,
            originalEdges: originalEdges,
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

    // --- REMOVE EDGES CONNECTED TO GROUPED NODES ---
    const edgesToRemove = edges.filter((edge) =>
      fullSelectedNodes.some(
        (node) => node.id === edge.source || node.id === edge.target,
      ),
    );

    // --- CREATE TEMPORARY EDGES TO MAINTAIN FLOW CONTINUITY ---
    const temporaryEdges: Edge[] = [];

    edgesToRemove.forEach((edge) => {
      const isSourceInGroup = fullSelectedNodes.some(
        (node) => node.id === edge.source,
      );
      const isTargetInGroup = fullSelectedNodes.some(
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

    // --- SET NEW EDGES: REMOVE ORIGINAL AND ADD TEMPORARY ---
    const filteredEdges = edges.filter((edge) => !edgesToRemove.includes(edge));
    const newEdges = [...filteredEdges, ...temporaryEdges];

    setNodes(updatedNodes);
    setEdges(newEdges);
  };

  const ungroupNodes = () => {
    if (!selectedNode?.data?.groupId) return;

    const groupId = selectedNode.data.groupId as string;

    // Find all nodes in the group
    const groupNodes = nodes.filter((node) => node?.data?.groupId === groupId);
    const groupHead = groupNodes.find((node) => node.data.isGroupHead);
    if (!groupHead) return;

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

    // Remove temporary edges belonging to the group
    const nonTemporaryEdges = edges.filter(
      (edge) => !edge?.data?.isTemporary || !edge.id.includes(groupId),
    );

    // Restore original edges from stored data
    const restoredEdges: Edge[] = (groupHead.data.originalEdges ||
      []) as Edge[];

    // Set final edges as non-temp + restored originals
    const finalEdges = [...nonTemporaryEdges, ...restoredEdges];

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
