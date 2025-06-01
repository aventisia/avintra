/* Inspired from: https://reactflow.dev/examples/nodes/delete-middle-node */
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import {
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  OnNodesDelete,
} from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { getIntermediateNodeIds } from "../utils/getIntermediateNodes";

export const useOnNodeDelete = () => {
  // Get ReactFlowExt store state & actions
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    flowVariablesObject,
    setFlowVariablesObject,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      flowVariablesObject: state.flowVariablesObject,
      setFlowVariablesObject: state.setFlowVariablesObject,
    })),
  );

  // Auto layout the flow
  const autoLayout = useDagreAutoLayout();

  const onNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      let newNodes = [...nodes];
      let newEdges = [...edges];
      let updatedFlowVariables = [...flowVariablesObject];

      deleted.forEach((node) => {
        // Check if it's a conditional node
        if (node.type === "conditionalNode") {
          const conditionalNodeId = node.id;
          const mergeNodeId = node.data?.mergeBranchesNodeId;

          if (!mergeNodeId) return;

          const nodeIdsToDelete = getIntermediateNodeIds(
            nodes,
            edges,
            conditionalNodeId,
          );

          // Remove all edges connected to these nodes
          newEdges = newEdges.filter(
            (edge) =>
              !nodeIdsToDelete.includes(edge.source) &&
              !nodeIdsToDelete.includes(edge.target),
          );

          // Reconnect flow
          const incomingEdge = edges.find(
            (edge) => edge.target === conditionalNodeId,
          );
          const outgoingEdge = edges.find(
            (edge) => edge.source === mergeNodeId,
          );

          if (incomingEdge && outgoingEdge) {
            newEdges.push(
              createPlusEdgeObj(incomingEdge.source, outgoingEdge.target),
            );
          }

          // Remove the conditional flow nodes
          newNodes = newNodes.filter((n) => !nodeIdsToDelete.includes(n.id));

          // Remove flow variables
          updatedFlowVariables = updatedFlowVariables.filter(
            (f) => !nodeIdsToDelete.includes(f.nodeId),
          );
        } else {
          // Standard deletion + reconnection
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          newEdges = newEdges.filter((edge) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => createPlusEdgeObj(source, target)),
          );

          newEdges = [...newEdges, ...createdEdges];

          // Remove the node
          newNodes = newNodes.filter((n) => n.id !== node.id);
          updatedFlowVariables = updatedFlowVariables.filter(
            (f) => f.nodeId !== node.id,
          );
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
      setFlowVariablesObject(updatedFlowVariables);

      // Optional: trigger layout
      autoLayout({ newNodes, newEdges });
    
    },
    [
      nodes,
      edges,
      setNodes,
      setEdges,
      flowVariablesObject,
      setFlowVariablesObject,
    ],
  );

  return { onNodesDelete };
};
