import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { addEdge, Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { createNewEdgeObj, createNewNodeObj } from "./add-node-utils";
import { useDagreAutoLayout } from "../useDagreAutoLayout";

export const useAddNode = () => {
  // Get ReactFlowExt store state & actions
  const { nodes, edges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    })),
  );

  // Auto layout the flow
  const { autoLayoutOnAdd } = useDagreAutoLayout();

  // Handler to add new node from placeholder node origin
  const addNodeFromPlaceholderNode = useCallback(
    (nodeData: NodeDataType, placeholderNodeId: string) => {
      // Get placeholder edge
      const placeholderEdge = edges.find(
        (edge) => edge.target === placeholderNodeId,
      ) as Edge;

      // Set source node Id and get source node
      const sourceNode = nodes.find(
        (node) => node.id === placeholderEdge.source,
      );

      // Create new node
      const newNode = createNewNodeObj(nodeData, sourceNode);

      // Update placeholder edge source to new node
      const updatedEdges = edges.map((edge) =>
        edge.id === placeholderEdge.id
          ? {
              ...placeholderEdge,
              source: newNode.id,
            }
          : edge,
      );

      // Create new edge between source node and new node
      const newEdge = createNewEdgeObj(placeholderEdge.source, newNode.id);

      // Auto organize node & edge
      autoLayoutOnAdd(nodes.concat(newNode), addEdge(newEdge, updatedEdges));
    },
    [edges, nodes, autoLayoutOnAdd],
  );

  return { addNodeFromPlaceholderNode };
};
