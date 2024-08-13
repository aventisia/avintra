/* Inspired from: https://reactflow.dev/examples/nodes/delete-middle-node */
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import {
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  OnNodesDelete,
} from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export const useOnNodeDelete = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Auto layout the flow
  const { autoLayoutOnAdd } = useDagreAutoLayout();

  // Handler to reconnect edges on node delete
  const onNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      // Create Reconnect edges
      const reconnectedEdges = deleted.reduce((acc, node) => {
        const incomers = getIncomers(node, nodes, edges);
        const outgoers = getOutgoers(node, nodes, edges);
        const connectedEdges = getConnectedEdges([node], edges);

        const remainingEdges = acc.filter(
          (edge) => !connectedEdges.includes(edge),
        );

        const createdEdges = incomers.flatMap(({ id: source }) =>
          outgoers.map(({ id: target }) => ({
            id: window.crypto.randomUUID(),
            type: "customStepEdge",
            source,
            target,
          })),
        );

        return [...remainingEdges, ...createdEdges];
      }, edges);

      // Auto organize node & edge
      autoLayoutOnAdd(nodes, reconnectedEdges);
    },
    [edges, autoLayoutOnAdd, nodes],
  );

  return { onNodesDelete };
};
