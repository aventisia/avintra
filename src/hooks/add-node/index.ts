import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { createFlowEndNodeEdgeObj, createNodesEdgesObj } from "./add-node-utils";
import { useDagreAutoLayout } from "../useDagreAutoLayout";
import { createEdgeObj } from "./create-edge";

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

  // Handler to add new node from plus node origin
  const addFirstNode = useCallback(
    (nodeData: NodeDataType, plusNodeId: string) => {
      // Get plus node edge
      const plusNodeEdge = edges.find(
        (edge) => edge.target === plusNodeId,
      ) as Edge;

      // Create first node & edge
      const {
        newNodes: firstNode,
        newEdges: firstEdge,
        lastNodeId: firstNodeId,
      } = createNodesEdgesObj(nodeData, plusNodeEdge.source);

      // Create flow end node & edge
      const { flowEndNode, flowEndEdge } =
        createFlowEndNodeEdgeObj(firstNodeId);

      // Add new nodes to the existing nodes & remove plus node
      const newNodes = nodes
        .filter((node) => node.id !== plusNodeId)
        .concat(firstNode, flowEndNode);

      // Add new edges to the existing edges
      const newEdges = edges
        .filter((edge) => edge.id !== plusNodeEdge.id)
        .concat(firstEdge, flowEndEdge);

      // Auto organize node & edge
      autoLayoutOnAdd(newNodes, newEdges);
    },
    [edges, nodes, autoLayoutOnAdd],
  );

  // Handler to add new node from custom step edge
  const addNodeFromCustomStepEdge = useCallback(
    (nodeData: NodeDataType, stepEdgeId: string) => {
      // Get step edge
      const stepEdge = edges.find((edge) => edge.id === stepEdgeId) as Edge;

      // Create new node & edge
      const { newNodes, newEdges, lastNodeId } = createNodesEdgesObj(
        nodeData,
        stepEdge.source,
      );

      // Update step edge source to new node
      const updatedEdges = edges.map((edge) =>
        edge.id === stepEdgeId
          ? {
              ...edge,
              source: lastNodeId,
            }
          : edge,
      );

      // Auto organize node & edge
      autoLayoutOnAdd(nodes.concat(newNodes), updatedEdges.concat(newEdges));
    },
    [edges, nodes, autoLayoutOnAdd],
  );

  // Handler to add new node from placeholder node
  const addNodeFromPlaceholderNode = useCallback(
    (nodeData: NodeDataType, placeholderNodeId: string) => {
      // Get branch start node edge
      const branchStartNodeEdge = edges.find(
        (edge) => edge.target === placeholderNodeId,
      ) as Edge;

      // Get branch end node edge
      const branchEndNodeEdge = edges.find(
        (edge) => edge.source === placeholderNodeId,
      ) as Edge;

      // Create new node & edge
      const { newNodes, newEdges, lastNodeId } = createNodesEdgesObj(
        nodeData,
        branchStartNodeEdge.source,
      );

      // Create edge from last node to branch end node
      const lastToBranchEndEdge = createEdgeObj(
        lastNodeId,
        branchEndNodeEdge.target,
      );

      // Add new nodes to the existing nodes & remove placeholder node
      const updatedNodes = nodes
        .filter((node) => node.id !== placeholderNodeId)
        .concat(newNodes);

      // Add new edges to the existing edges & remove branch node edges
      const updatedEdges = edges
        .filter(
          (edge) =>
            edge.id !== branchStartNodeEdge.id ||
            edge.id !== branchEndNodeEdge.id,
        )
        .concat(newEdges, lastToBranchEndEdge);

      // Auto organize node & edge
      autoLayoutOnAdd(updatedNodes, updatedEdges);
    },
    [edges, nodes, autoLayoutOnAdd],
  );

  return {
    addFirstNode,
    addNodeFromCustomStepEdge,
    addNodeFromPlaceholderNode,
  };
};
