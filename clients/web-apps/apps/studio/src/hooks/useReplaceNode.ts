import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export const useReplaceNode = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, setNodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );

  // Handler to replace node
  const replaceNodeHandler = useCallback(
    (nodeData: NodeDataType) => {
      // Get selected node
      const selectedNode = nodes.find((node) => node.selected);

      // Return if no node selected
      if (!selectedNode) return;

      // Create a new node object with updated data
      const updatedNode = {
        ...selectedNode,
        data: nodeData,
      };

      // Replace the old node with the new node in the nodes array
      const updatedNodes = nodes.map((node) =>
        node.id === selectedNode.id ? updatedNode : node,
      );

      // Update nodes state
      setNodes(updatedNodes);
    },
    [nodes, setNodes],
  );

  return replaceNodeHandler;
};
