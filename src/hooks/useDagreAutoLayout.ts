import { LayoutDirectionType } from "@/react-toolkit/types/user-preferences-type";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import dagre from "@dagrejs/dagre";
import { Edge, Node, Position } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

// Type for node width and height lookup
type NodeDimension = {
  nodeType: string;
  width: number;
  height: number;
};

// Create lookup array for node's custom width and height
const nodeCustomDimensions: NodeDimension[] = [
  { nodeType: "flowEndNode", width: 142.5, height: 44 },
];

const nodeDefaultWidth = 340; // Default Width of the node in pixels.
const nodeDefaultHeight = 85; // Default Height of the node in pixels.

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
    // Get the width and height of the node
    const nodeDimension = nodeCustomDimensions.find(
      (d) => d.nodeType === node.type,
    ) as NodeDimension;

    // Set the node to the dagre graph
    dagreGraph.setNode(node.id, {
      width: nodeDimension ? nodeDimension.width : nodeDefaultWidth,
      height: nodeDimension ? nodeDimension.height : nodeDefaultHeight,
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

    // Get the width and height of the node
    const nodeDimension = nodeCustomDimensions.find(
      (d) => d.nodeType === node.type,
    ) as NodeDimension;

    // Set target and source positions based on the direction
    const newNode: Node = {
      ...node,
      targetPosition: direction === "LR" ? Position.Left : Position.Top,
      sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,

      position: {
        x:
          nodeWithPosition.x -
          (nodeDimension ? nodeDimension.width : nodeDefaultWidth) / 2,
        y:
          nodeWithPosition.y -
          (nodeDimension ? nodeDimension.height : nodeDefaultHeight) / 2,
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
