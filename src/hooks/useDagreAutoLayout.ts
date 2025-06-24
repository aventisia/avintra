import { AUTO_LAYOUT_ANIMATION_DURATION } from "@/constants";
import { nodeDimensionLookup } from "@/constants/node-dimension-lookup";
import { LayoutDirectionType } from "@/react-toolkit/types/user-preferences-type";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { CustomNodeType } from "@/types/custom-node-type";
import dagre from "@dagrejs/dagre";
import { Edge, Node, Position } from "@xyflow/react";
import { timer } from "d3-timer";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

// Get the minlen for the edge based on the node type
const getEdgeMinlen = (
  sourceNodeType?: CustomNodeType,
  targetNodeType?: CustomNodeType,
) => {
  if (sourceNodeType === "branchNode1") return 4;
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
      minlen: getEdgeMinlen(
        sourceNode?.type as CustomNodeType,
        targetNode?.type as CustomNodeType,
      ), // Set the minlen for the edge. It multiplies the ranksep value.
    });
  });

  // Perform the layout
  dagre.layout(dagreGraph);

  // To ensure branchNode1s' siblings have identical y-position
  const siblingGroups: { [parentId: string]: Node[] } = {};

  // Group branchNode1s by their parent node to adjust their positions later
  nodes.forEach((node) => {
    if (node.type === "branchNode1") {
      // Find the parent node by its target edge
      const parentNode = edges.find((edge) => edge.target === node.id);
      if (parentNode) {
        const parentId = parentNode.source;
        if (!siblingGroups[parentId]) {
          siblingGroups[parentId] = [];
        }
        siblingGroups[parentId].push(node);
      }
    }
  });

  // Adjust the y-axis positions for sibling branchNode1s
  const adjustedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Get the width and height of the node
    const nodeDimension = nodeDimensionLookup[node.type as CustomNodeType];

    // If the node is a branchNode1 and it has siblings, adjust the y-position
    if (node.type === "branchNode1") {
      const parentId = edges.find((edge) => edge.target === node.id)?.source;
      if (parentId && siblingGroups[parentId]) {
        // Get the parent node's position (we'll use this for the siblings' position)
        const parentNodePosition = dagreGraph.node(parentId);

        // Add space (height of two nodes) to the parent's y-position to prevent overlap
        const siblingYPosition = parentNodePosition.y + 150;

        // Assign the adjusted y-position to the current node
        nodeWithPosition.y = siblingYPosition;
      }
    }

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

  return { nodes: adjustedNodes, edges };
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

  /** Organize the nodes and edges using the Dagre auto layout algorithm */
  const autoLayout = useCallback(
    (newNodesEdgesObj?: { newNodes: Node[]; newEdges: Edge[] }) => {
      const currentNodes = newNodesEdgesObj?.newNodes || nodes;
      const currentEdges = newNodesEdgesObj?.newEdges || edges;

      // 💡 Filter only visible nodes
      const visibleNodes = currentNodes.filter((node) => !node.hidden);

      // 💡 Filter edges where both source and target are visible
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
      const visibleEdges = currentEdges.filter(
        (edge) =>
          visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
      );

      // 🧠 Layout only visible nodes and edges
      const { nodes: layoutedVisibleNodes } = getLayoutedElements(
        visibleNodes,
        visibleEdges,
        layoutDirection,
      );

      // 💾 Keep original positions for hidden nodes
      const hiddenNodes = currentNodes.filter((node) => node.hidden);

      // 🧩 Merge back all nodes: layouted visible + unchanged hidden
      const allLayoutedNodes = [...layoutedVisibleNodes, ...hiddenNodes];

      setEdges([...currentEdges]); // Keep all original edges including temporary
      const duration = AUTO_LAYOUT_ANIMATION_DURATION;

      const startPositions = currentNodes.map((node) => node.position);
      const endPositions = allLayoutedNodes.map((node) => node.position);

      // Animate using D3
      const d3Timer = timer((elapsed: number) => {
        const progress = Math.min(elapsed / duration, 1);
        // Interpolate the positions of the nodes
        const interpolatedNodes = allLayoutedNodes.map((node, index) => ({
          ...node,
          position: {
            x:
              startPositions[index]?.x +
              (endPositions[index]?.x - startPositions[index]?.x) * progress,
            y:
              startPositions[index]?.y +
              (endPositions[index]?.y - startPositions[index]?.y) * progress,
          },
        }));

        // Set the nodes with the interpolated positions
        setNodes(interpolatedNodes);

        // Stop the timer if the progress reaches 100%
        if (progress === 1) d3Timer.stop();
      });
    },
    [nodes, edges, layoutDirection, setNodes, setEdges],
  );

  // Return the auto layout function
  return autoLayout;
};
