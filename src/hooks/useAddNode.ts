import { Node } from "@xyflow/react";
import { useCallback } from "react";
import { ActivityNodeDataType } from "@/types";
import { useReactFlowExtStore } from "@/stores";
import { useShallow } from "zustand/react/shallow";

export const useAddNode = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, setNodes } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
    })),
  );

  // Handler to add new node
  const addNode = useCallback(
    (nodeData: ActivityNodeDataType) => {
      // Create new node
      const node: Node = {
        id: window.crypto.randomUUID(),
        type: nodeData.type,
        data: nodeData,
        position: { x: 100, y: 200 },
      };

      // Update nodes state
      setNodes(nodes.concat(node));
    },
    [setNodes, nodes],
  );

  return addNode;
};
