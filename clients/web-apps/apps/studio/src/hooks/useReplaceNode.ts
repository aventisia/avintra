import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  isSingleNodeAgentFlow,
  notifySingleNodeAgentActionNotAllowed,
} from "@/features/react-flow/utils/single-node-agent-flow.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";

export const useReplaceNode = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, flowType, setNodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      flowType: state.flowType,
      setNodes: state.setNodes,
    })),
  );

  // Handler to replace node
  const replaceNodeHandler = useCallback(
    (nodeData: NodeDataType) => {
      if (isSingleNodeAgentFlow(flowType)) {
        notifySingleNodeAgentActionNotAllowed(flowType);
        return;
      }

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
      const updatedNodes = nodes.map((node) => (node.id === selectedNode.id ? updatedNode : node));

      // Update nodes state
      setNodes(updatedNodes);
    },
    [nodes, setNodes, flowType],
  );

  return replaceNodeHandler;
};
