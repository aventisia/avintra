import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
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

  // Handler to add new node from placeholder node origin
  const addNodeFromPlaceholderNode = useCallback(
    (nodeData: NodeDataType, placeholderNodeId: string) => {
      // Get placeholder node
      const placeholderNode = nodes.find(
        (node) => node.id === placeholderNodeId,
      ) as Node;

      // Get placeholder edge
      const placeholderEdge = edges.find(
        (edge) => edge.target === placeholderNodeId,
      ) as Edge;

      // Set source node Id
      const sourceNodeId = placeholderEdge.source;

      // Get source node
      const sourceNode = nodes.find((node) => node.id === sourceNodeId);

      // Create new node Id
      const newNodeId = window.crypto.randomUUID();

      // Create new node X,Y
      const newNodeXY = getNewNodeXY(
        sourceNode?.position || { x: 0, y: 0 },
        sourceNode?.measured?.width || 0,
        sourceNode?.measured?.height || 0,
        sourceNode?.sourcePosition,
      );

      // Create new node
      const newNode: Node = {
        id: newNodeId,
        type: nodeData.type,
        data: nodeData,
        position: newNodeXY,
        deletable: true,
        draggable: true,
        selectable: true,
        sourcePosition: sourceNode?.sourcePosition,
      };

      // Add new nodes to the nodes array
      const newNodes = nodes.concat(newNode);

      // Get placeholder node new X,Y
      const placeholderNodeNewXY = getNewNodeXY(
        newNode?.position || { x: 0, y: 0 },
        sourceNode?.measured?.width || 0,
        sourceNode?.measured?.height || 0,
        newNode?.sourcePosition,
      );

      // Update placeholder node's position
      const updatedPlaceholderNode = {
        ...placeholderNode,
        position: placeholderNodeNewXY,
      };

      // Replace the old placeholder node with the new node in the nodes array
      const updatedNodes = newNodes.map((node) =>
        node.id === placeholderNode.id ? updatedPlaceholderNode : node,
      );

      // Update nodes state
      setNodes(updatedNodes);

      // Update placeholder edge source to new node
      const updatedPlaceholderEdge = {
        ...placeholderEdge,
        source: newNodeId,
      };

      // Replace the old placeholder edge with the updated edge in the edges array
      const updatedEdges = edges.map((edge) =>
        edge.id === placeholderEdge.id ? updatedPlaceholderEdge : edge,
      );

      // Create new edge between source node and new node
      const newEdge: Edge = {
        id: window.crypto.randomUUID(),
        type: "customStepEdge",
        source: sourceNodeId,
        target: newNodeId,
        deletable: false,
        selectable: false,
      };

      // Update edges state
      setEdges(addEdge(newEdge, updatedEdges));
    },
    [nodes, setNodes, setEdges, edges],
  );

  return addNodeFromPlaceholderNode;
};
