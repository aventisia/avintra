import { LayoutDirectionType } from "@/react-toolkit/types/user-preferences-type";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import dagre from "@dagrejs/dagre";
import { Edge, Node, Position } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

const nodeWidth = 340; // Width of the node in pixels.
const nodeHeight = 85; // Height of the node in pixels.

// Function to layout the elements using dagre
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirectionType,
) => {
  // Create a new dagre graph instance
  const dagreGraph = new dagre.graphlib.Graph();

  // TODO: Set an object for the default edge label
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set configurations for the dagre graph
  dagreGraph.setGraph({
    rankdir: direction, // Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
    nodesep: 80, // Number of pixels that separate nodes horizontally in the layout.
    ranksep: 80, // Number of pixels between each rank in the layout.
  });

  // Set nodes to the dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: nodeWidth, 
      height: nodeHeight,
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
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
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
  const { nodes, edges, setNodes, setEdges } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  );

  // Get Studio Preferences store state
  const { layoutDirection } = useStudioPreferencesStore(
    useShallow((state) => ({
      layoutDirection: state.studioPreferences.layoutDirection,
    })),
  );

  const autoLayout = useCallback(() => {
    // Get layouted nodes and edges
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      layoutDirection,
    );

    // Set the layouted nodes and edges
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, layoutDirection, setNodes, setEdges]);

  const autoLayoutOnAdd = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      // Get layouted nodes and edges
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(newNodes, newEdges, layoutDirection);

      // Set the layouted nodes and edges
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [layoutDirection, setNodes, setEdges],
  );

  return { autoLayout, autoLayoutOnAdd };
};
