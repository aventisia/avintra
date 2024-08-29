import { LayoutDirectionType } from "@/react-toolkit/types/user-preferences-type";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { CustomNodeType } from "@/types/custom-node-type";
import dagre from "@dagrejs/dagre";
import { Edge, Node, Position } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

// Type for node width and height lookup
type NodeDimension = {
  width: number;
  height: number;
};

// Create lookup array for node's custom width and height
const nodeDimensionLookup: Record<CustomNodeType, NodeDimension> = {
  branchStartNode: { width: 10, height: 10 },
  branchEndNode: { width: 10, height: 10 },
  mergeBranchesNode: { width: 14.5, height: 16 },
  flowEndNode: { width: 142.5, height: 44.2 },
  plusFirstNode: { width: 340, height: 82.7 },
  plusNode: { width: 340, height: 82.7 },
  ifElseNode: { width: 340, height: 85 },
  triggerNode: { width: 340, height: 85 },
  activityNode: { width: 340, height: 85 },
  switchCaseNode: { width: 340, height: 85 },
  whileLoopNode: { width: 340, height: 85 },
  forLoopNode: { width: 340, height: 85 },
  forEachLoopNode: { width: 340, height: 85 },
};

// Get the minlen for the edge based on the node type
const getEdgeMinlen = (sourceNodeType?: string, targetNodeType?: string) => {
  if (sourceNodeType === "branchStartNode") return 4;
  if (targetNodeType === "branchEndNode") return 4;
  if (sourceNodeType === "mergeBranchesNode") return 6;
  return 8;
};

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
    nodesep: 200, // Number of pixels that separate nodes horizontally in the layout.
    ranksep: 12, // Number of pixels between each rank in the layout.
  });

  // Set nodes to the dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      ...nodeDimensionLookup[node.type as CustomNodeType], // Set the width and height of the node
    });
  });

  // Set edges to the dagre graph
  edges.forEach((edge) => {
    // Get the source and target nodes
    const sourceNode = nodes.find((n) => n.id === edge.source) as Node;
    const targetNode = nodes.find((n) => n.id === edge.target) as Node;

    dagreGraph.setEdge(edge.source, edge.target, {
      minlen: getEdgeMinlen(sourceNode?.type, targetNode?.type), // Set the minlen for the edg. It multiplies the ranksep value.
    });
  });

  // Do the layout
  dagre.layout(dagreGraph);

  // Update the nodes and edges with the layouted positions
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Get the width and height of the node
    const nodeDimension = nodeDimensionLookup[node.type as CustomNodeType];

    // Set target and source positions based on the direction
    const newNode: Node = {
      ...node,
      targetPosition: direction === "LR" ? Position.Left : Position.Top,
      sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,

      position: {
        x: nodeWithPosition.x - nodeDimension.width / 2,
        y: nodeWithPosition.y - nodeDimension.height / 2,
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
