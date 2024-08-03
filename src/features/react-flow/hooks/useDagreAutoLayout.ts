import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import dagre from "@dagrejs/dagre";
import { Edge, Node, Position } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

// Create a new dagre graph instance
const dagreGraph = new dagre.graphlib.Graph();

// TODO: Set an object for the default edge label
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

// Function to layout the elements using dagre
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR",
) => {
  // Set configurations for the dagre graph
  dagreGraph.setGraph({
    rankdir: direction, // Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
    nodesep: 80, // Number of pixels that separate nodes horizontally in the layout.
    ranksep: 80, // Number of pixels between each rank in the layout.
  });

  // Set nodes to the dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.measured?.width, // Width of the node in pixels.
      height: node.measured?.height, // Height of the node in pixels.
    });
  });

  // Set edges to the dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Do the layout
  dagre.layout(dagreGraph);

  // Update the nodes and edges with the layouted positions
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Set target and source positions based on the direction
    const newNode: Node = {
      ...node,
      targetPosition: direction === "LR" ? Position.Left : Position.Top,
      sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,

      position: {
        x: nodeWithPosition.x - (node?.measured?.width ?? nodeWidth) / 2,
        y: nodeWithPosition.y - (node?.measured?.height ?? nodeHeight) / 2,
      },
    };

    // Return updated node
    return newNode;
  });

  // Return the layouted nodes
  return { nodes: newNodes, edges: edges };
};

/**
 * Custom hook that applies the Dagre auto layout algorithm to the nodes and edges of a graph.
 */
export const useDagreAutoLayout = () => {
  // Get ReactFlowExt store state & actions
  const {
    nodes,
    edges,
    isAutoLayoutPending,
    setIsAutoLayoutPending,
    setNodes,
    setEdges,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      isAutoLayoutPending: state.isAutoLayoutPending,
      nodes: state.nodes,
      edges: state.edges,
      setIsAutoLayoutPending: state.setIsAutoLayoutPending,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  );

  const autoLayout = useCallback(
    (direction: "TB" | "LR") => {
      // Get layouted nodes and edges
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      // Set the layouted nodes and edges
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges],
  );

  // Applyauto layout if isAutoLayoutPending is true (Node or edge added/removed)
  useEffect(() => {
    if (isAutoLayoutPending) {
      autoLayout("TB");
      setIsAutoLayoutPending(false);
    }
  }, [autoLayout, isAutoLayoutPending, setIsAutoLayoutPending]);

  return { autoLayout };
};
