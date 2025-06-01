import { useClipboard } from "@/features/react-flow/hooks/useClipboard";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { getIntermediateNodeIds } from "../utils/getIntermediateNodes";

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
      const nodeToDelete = nodes.find((node) => node.id === nodeId);
      if (!nodeToDelete) return;

      showDefaultAlertDialog({
        alertType: "delete",
        confirmActionFn: () => {
          let updatedNodes = [...nodes];
          let updatedEdges = [...edges];
          let updatedFlowVariables = [...flowVariablesObject];

          if (nodeToDelete.type === "conditionalNode") {
            const mergeNodeId = nodeToDelete.data?.mergeBranchesNodeId;
            if (!mergeNodeId) return;

            // Get all related node IDs (conditional, intermediates, merge)
            const nodeIdsToDelete = getIntermediateNodeIds(
              nodes,
              edges,
              nodeId,
            );

            // Remove all edges connected to those nodes
            updatedEdges = updatedEdges.filter(
              (edge) =>
                !nodeIdsToDelete.includes(edge.source) &&
                !nodeIdsToDelete.includes(edge.target),
            );

            // Find entry and exit edges
            const incomingEdge = edges.find((edge) => edge.target === nodeId);
            const outgoingEdge = edges.find(
              (edge) => edge.source === mergeNodeId,
            );

            // Reconnect flow if both ends exist
            if (incomingEdge && outgoingEdge) {
              updatedEdges.push(
                createPlusEdgeObj(incomingEdge.source, outgoingEdge.target),
              );
            }

            // Remove the conditional and merge nodes
            updatedNodes = updatedNodes.filter(
              (n) => !nodeIdsToDelete.includes(n.id),
            );

            // Remove related flow variables
            updatedFlowVariables = updatedFlowVariables.filter(
              (f) => !nodeIdsToDelete.includes(f.nodeId),
            );
          } else {
            // Non-conditional node: reconnect using helper
            updatedEdges = reconnectEdges(nodeId, updatedEdges);

            // Remove the node
            updatedNodes = updatedNodes.filter((n) => n.id !== nodeId);

            // Remove related flow variables
            updatedFlowVariables = updatedFlowVariables.filter(
              (f) => f.nodeId !== nodeId,
            );
          }

          setNodes(updatedNodes);
          setEdges(updatedEdges);
          setFlowVariablesObject(updatedFlowVariables);
        },
      });
    },
    [
      nodes,
      edges,
      setNodes,
      setEdges,
      flowVariablesObject,
      setFlowVariablesObject,
      showDefaultAlertDialog,
      reconnectEdges,
    ],
  );

  return {
    copyNode,
    cutNode,
    pasteNode,
    deleteNode,
  };
};
