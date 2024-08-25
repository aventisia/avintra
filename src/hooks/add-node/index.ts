import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeDataType } from "@/types/node-data-type";
import { Edge } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDagreAutoLayout } from "../useDagreAutoLayout";
import {
  createFlowEndNodeEdgeObj,
  createNodesEdgesObj,
} from "./add-node-utils";
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

      // Get plus node index
      const plusNodeIndex = nodes.findIndex((node) => node.id === plusNodeId);

      // Add new nodes & remove plus node
      const updatedNodes = [
        ...nodes.slice(0, plusNodeIndex),
        ...firstNode,
        ...[flowEndNode],
        ...nodes.slice(plusNodeIndex + 1),
      ];

      // Get plus node edge index
      const plusNodeEdgeIndex = edges.findIndex(
        (edge) => edge.id === plusNodeEdge.id,
      );

      // Add new edges & remove plus node edge
      const updatedEdges = [
        ...edges.slice(0, plusNodeEdgeIndex),
        ...firstEdge,
        flowEndEdge,
        ...edges.slice(plusNodeEdgeIndex + 1),
      ];

      // Auto organize node & edge
      autoLayoutOnAdd(updatedNodes, updatedEdges);
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

      // Get source node index
      const sourceNodeIndex = nodes.findIndex(
        (node) => node.id === stepEdge.source,
      );

      // Add new nodes after source node
      const updatedNodes = [
        ...nodes.slice(0, sourceNodeIndex + 1),
        ...newNodes,
        ...nodes.slice(sourceNodeIndex + 1),
      ];

      // Update step edge source to new node
      const updatedEdges1 = edges.map((edge) =>
        edge.id === stepEdgeId
          ? {
              ...edge,
              source: lastNodeId,
            }
          : edge,
      );

      // Get step edge index
      const stepEdgeIndex = edges.findIndex((edge) => edge.id === stepEdgeId);

      // Add new edges before step edge
      const updatedEdges2 = [
        ...updatedEdges1.slice(0, stepEdgeIndex),
        ...newEdges,
        ...updatedEdges1.slice(stepEdgeIndex),
      ];

      // Auto organize node & edge
      autoLayoutOnAdd(updatedNodes, updatedEdges2);
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

      // Get placeholder node index
      const placeholderNodeIndex = nodes.findIndex(
        (node) => node.id === placeholderNodeId,
      );

      // Add new nodes & remove placeholder node
      const updatedNodes = [
        ...nodes.slice(0, placeholderNodeIndex),
        ...newNodes,
        ...nodes.slice(placeholderNodeIndex + 1),
      ];

      // Get branch start node edge index
      const branchStartNodeEdgeIndex = edges.findIndex(
        (edge) => edge.id === branchStartNodeEdge.id,
      );

      // Add branch start new edge & remove old one
      const updatedEdges1 = [
        ...edges.slice(0, branchStartNodeEdgeIndex),
        ...newEdges,
        ...edges.slice(branchStartNodeEdgeIndex + 1),
      ];

      // Get branch end node edge index
      const branchEndNodeEdgeIndex = edges.findIndex(
        (edge) => edge.id === branchEndNodeEdge.id,
      );

      // Add branch start new edge & remove old one
      const updatedEdges = [
        ...updatedEdges1.slice(0, branchEndNodeEdgeIndex),
        lastToBranchEndEdge,
        ...updatedEdges1.slice(branchEndNodeEdgeIndex + 1),
      ];

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
