import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { addEdge, Edge, Node, useStoreApi } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { getNewNodeXY } from "./get-new-node-xy";

export const useAddNode = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges, setIsAutoLayoutPending, setNodes, setEdges } =
    useReactFlowExtStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        setIsAutoLayoutPending: state.setIsAutoLayoutPending,
        setNodes: state.setNodes,
        setEdges: state.setEdges,
      })),
    );

  // Get addSelectedNodes action from RF store
  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();

  // Handler to add new node
  const addNodeHandler = useCallback(
    (nodeData: NodeDataType) => {
      // Get selected node (if any selected)
      const selectedNode = nodes.find((node) => node.selected);

      // Create new node Id
      const newNodeId = window.crypto.randomUUID();

      // Create new node X,Y
      const newNodeXY = getNewNodeXY(
        selectedNode?.position || { x: 0, y: 0 },
        selectedNode?.measured?.width || 0,
        selectedNode?.measured?.height || 0,
        selectedNode?.sourcePosition,
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

      // Set auto layout pending
      setIsAutoLayoutPending(true);

      // Select the newly created node
      setTimeout(() => addSelectedNodes([newNodeId]), 0); // Delay to ensure the node is added before selecting it

      // Return if no node selected or node type is trigger
      if (!selectedNode || nodeData.type === "trigger") return;

      // Create new edge
      const newEdge: Edge = {
        id: window.crypto.randomUUID(),
        source: selectedNode.id,
        target: newNodeId,
      };

      // Update edges state
      setEdges(addEdge(newEdge, edges));
    },
    [
      nodes,
      setNodes,
      setIsAutoLayoutPending,
      setEdges,
      edges,
      addSelectedNodes,
    ],
  );

  return addNodeHandler;
};
