import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { ActivityNodeDataType } from "@/types/ActivityNodeDataType";
import { addEdge, Edge, Node } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { getNewNodeXY } from "./get-new-node-xy";

export const useAddNode = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges, setNodes, setEdges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  );

  // Handler to add new node
  const addNodeHandler = useCallback(
    (nodeData: ActivityNodeDataType) => {
      // Get selected node (if any selected)
      const selectedNode = nodes.find((node) => node.selected);

      // Create new node Id
      const newNodeId = window.crypto.randomUUID();

      // Create new node X,Y
      const newNodeXY = getNewNodeXY(
        selectedNode?.position || { x: 0, y: 0 },
        selectedNode?.measured?.width || 0,
        selectedNode?.measured?.height || 0,
        nodeData.sourcePosition,
      );

      // Create new node
      const newNode: Node = {
        id: newNodeId,
        type: nodeData.type,
        data: nodeData,
        position: newNodeXY,
      };

      // Update nodes state
      setNodes(nodes.concat(newNode));

      // Select the newly created node

      // Return if no node selected
      if (!selectedNode) return;

      // Create new edge
      const newEdge: Edge = {
        id: window.crypto.randomUUID(),
        type: "step",
        source: selectedNode.id,
        target: newNodeId,
      };

      // Update edges state
      setEdges(addEdge(newEdge, edges));
    },
    [nodes, setNodes, setEdges, edges],
  );

  return addNodeHandler;
};
