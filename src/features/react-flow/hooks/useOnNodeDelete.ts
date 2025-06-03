/* Inspired from: https://reactflow.dev/examples/nodes/delete-middle-node */
import { useDagreAutoLayout } from "@/hooks/useDagreAutoLayout";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { OnNodesDelete } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { getNodesAndEdgesAfterDeletion } from "../utils/getNodesAndEdgesAfterDeletion";

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
    (deletedNodes) => {
      try {
        let updatedNodes = [...nodes];
        let updatedEdges = [...edges];
        let updatedFlowVariables = [...flowVariablesObject];

        for (const node of deletedNodes) {
          const result = getNodesAndEdgesAfterDeletion({
            node,
            nodes: updatedNodes,
            edges: updatedEdges,
            flowVariables: updatedFlowVariables,
            allowBranchDeletion: true, // safe to allow in bulk delete
          });

          updatedNodes = result.updatedNodes;
          updatedEdges = result.updatedEdges;
          updatedFlowVariables = result.updatedFlowVariables;
        }

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setFlowVariablesObject(updatedFlowVariables);
        autoLayout({ newNodes: updatedNodes, newEdges: updatedEdges });
      } catch (err) {
        console.warn((err as Error).message);
      }
    },
    [nodes, edges, flowVariablesObject, autoLayout],
  );

  return { onNodesDelete };
};
