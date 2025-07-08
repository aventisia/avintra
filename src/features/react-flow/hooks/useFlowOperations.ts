import { useClipboard } from "@/features/react-flow/hooks/useClipboard";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { getNodesAndEdgesAfterDeletion } from "../utils/getNodesAndEdgesAfterDeletion";
import { toast } from "@aventisia/ui/sonner";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { useShallow } from "zustand/react/shallow";
import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";

/* Hook to perform cut copy paste and delete operations on nodes */
export const useFlowOperations = () => {
  // Get nodes/edges and setter functions
  const {
    nodes,
    edges,
    flowVariablesObject,
    setFlowVariablesObject,
    setNodes,
    setEdges,
  } = useReactFlowExtStore();

  // Get selected nodes/edges
  const { selectedNode } = useContextMenuActionsStore(
    useShallow((state) => ({ selectedNode: state.selectedNode })),
  );

  // Get Studio Preferences store state
  const { deleteAlert } = useStudioPreferencesStore(
    useShallow((state) => ({
      deleteAlert: state.studioPreferences.deleteAlert,
    })),
  );

  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  // Get clipboard actions
  const { getClipboard, setClipboard, clearClipboard } = useClipboard();

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Helper function to reconnect edges after node removal
  const reconnectEdges = useCallback((nodeId: string, edges: Edge[]) => {
    // Get incoming edges of the node
    const incomingEdge = edges.find((edge) => edge.target === nodeId);

    //Get outgoing edges  of the node
    const outgoingEdge = edges.find((edge) => edge.source === nodeId);

    // Remove edges connected to the node
    const newEdges = edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    // If both incoming and outgoing edges exist, create a new connection
    if (incomingEdge && outgoingEdge) {
      newEdges.push(
        createPlusEdgeObj(incomingEdge.source, outgoingEdge.target),
      );
    }

    return newEdges;
  }, []);

  //Define copyNode
  const copyNode = useCallback(
    (nodeId: string) => {
      const nodeToCopy = nodes.find((node) => node.id === nodeId);
      if (nodeToCopy) {
        setClipboard({
          node: { ...nodeToCopy },
          operation: "copy",
        });
      }
    },
    [nodes, setClipboard],
  );

  // Define cutNode
  const cutNode = useCallback(
    (nodeId: string) => {
      const nodeToCut = nodes.find((node) => node.id === nodeId);

      if (nodeToCut) {
        // Mark the node as cut
        setNodes(
          nodes.map((node) =>
            node.id === nodeId
              ? { ...node, style: { ...node.style, opacity: 0.4 } }
              : node,
          ),
        );

        setClipboard({
          node: { ...nodeToCut },
          operation: "cut",
        });
      }
    },
    [nodes, setNodes, setClipboard],
  );

  // Define pasteNode
  const pasteNode = useCallback(
    (sourceId: string, targetId: string) => {
      const clipboard = getClipboard();

      if (!clipboard.node) return;

      const sourceNode = nodes.find((n) => n.id === sourceId);
      const targetNode = nodes.find((n) => n.id === targetId);

      if (!sourceNode || !targetNode) return;

      // Calculate new position between source and target nodes
      const newX = (sourceNode.position.x + targetNode.position.x) / 2;
      const newY = (sourceNode.position.y + targetNode.position.y) / 2;

      const newNode = {
        ...clipboard.node,
        id: window.crypto.randomUUID(),
        position: { x: newX, y: newY },
        style: { ...clipboard.node.style, opacity: 1 },
      };

      // Remove the edge where we're pasting
      let newEdges = edges.filter(
        (edge) => !(edge.source === sourceId && edge.target === targetId),
      );

      // If this is a cut operation, remove old edges and reconnect remaining nodes
      if (clipboard.operation === "cut") {
        // Remove old edges from the cut node's original position and reconnect
        newEdges = reconnectEdges(clipboard.node.id, newEdges);
        // Remove the cut node from its original position
        setNodes(nodes.filter((node) => node.id !== clipboard.node!.id));
      }

      // Add new edges for the pasted node
      newEdges.push(
        {
          id: window.crypto.randomUUID(),
          source: sourceId,
          target: newNode.id,
          type: "customStepEdge",
          label: "plus",
        },
        {
          id: window.crypto.randomUUID(),
          source: newNode.id,
          target: targetId,
          type: "customStepEdge",
          label: "plus",
        },
      );
      if (clipboard.operation === "cut") {
        // Update nodes
        setNodes([
          ...nodes.filter((node) => node.id !== clipboard.node!.id),
          newNode,
        ]);
      }
      if (clipboard.operation === "copy") {
        // Update nodes
        setNodes([...nodes, newNode]);
      }

      setEdges(newEdges);
      clearClipboard();
    },
    [
      nodes,
      edges,
      setNodes,
      setEdges,
      getClipboard,
      clearClipboard,
      reconnectEdges,
    ],
  );

  // Define deleteNode
  const deleteNode = useCallback(
    (nodeId: string) => {
      // Find the node to delete
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Find the parent conditional node (if any) that this node branches from
      const parentNode = nodes.find(
        (n) =>
          n.type === "conditionalNode" &&
          n.data?.mergeBranchesNodeId === node?.data?.mergeBranchesNodeId,
      );

      // Get the list of branch IDs from the parent node
      const branches: string[] = (parentNode?.data?.branches ?? []) as string[];

      // Prevent deletion if fewer than 2 branches would remain
      if (branches.length <= 2 && node?.type == "branchNode1") {
        toast.info("At least two branches are required.");
        return;
      }

      // Perform the actual deletion logic
      const performDelete = () => {
        const { updatedNodes, updatedEdges, updatedFlowVariables } =
          getNodesAndEdgesAfterDeletion({
            node,
            nodes,
            edges,
            flowVariables: flowVariablesObject,
          });

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setFlowVariablesObject(updatedFlowVariables);

        // Trigger auto-layout to reposition nodes after deletion
        autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
      };

      // Conditionally show alert dialog before deleting
      if (deleteAlert) {
        showDefaultAlertDialog({
          alertType: "delete",
          confirmActionFn: performDelete,
        });
      } else {
        performDelete();
      }
    },
    [nodes, edges, flowVariablesObject, showDefaultAlertDialog, autoLayout],
  );

  const disableNode = (isDisabled: boolean) => {
    // Find the node by id and update its inputs and outputs
    const updatedNodes = nodes.map((node: Node) => {
      if (node.id === selectedNode?.id) {
        return {
          ...node,
          data: {
            ...node.data,
            isDisabled,
          },
        };
      }
      return node;
    });

    // Update the nodes in the store
    setNodes(updatedNodes);
  };

  return {
    copyNode,
    cutNode,
    pasteNode,
    deleteNode,
    disableNode,
  };
};
