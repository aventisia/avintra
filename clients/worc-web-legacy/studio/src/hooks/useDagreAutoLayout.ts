import { NODE_HEIGHT, NODE_WIDTH } from "@/constants";
import { nodeDimensionLookup } from "@/constants/node-dimension-lookup";
import { LayoutDirectionType } from "@/react-toolkit/types/user-preferences-type";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useStudioPreferencesStore } from "@/stores/studio-preferences-store";
import { CustomNodeType } from "@/types/custom-node-type";

import dagre from "@dagrejs/dagre";
import { Edge, Node, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

// // Get the minlen for the edge based on the node type
// const getEdgeMinlen = (
//   sourceNodeType?: CustomNodeType,
//   targetNodeType?: CustomNodeType,
// ) => {
//   if (targetNodeType === "branchNode1") return 1; // 2 ranks * 40px = 80px gap
//   if (targetNodeType === "branchEndNode") return 1; // 1 rank * 40px = 40px gap
//   if (sourceNodeType === "mergeBranchesNode") return 1;
//   return 1; // Default 40px gap
// };
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
    nodesep: 132, // Number of pixels that separate nodes horizontally in the layout.
    ranksep: 64, // Number of pixels between each rank in the layout.
  });
  const nodeMap = new Map<string, Node>();
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    const dimensions = nodeDimensionLookup[node.type as CustomNodeType] || {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    dagreGraph.setNode(node.id, { ...dimensions });
  });
  const edgeTargetToSourceMap = new Map<string, string>();
  edges.forEach((edge) => {
    edgeTargetToSourceMap.set(edge.target, edge.source);
    dagreGraph.setEdge(edge.source, edge.target);
  });
  // Perform the layout
  dagre.layout(dagreGraph);
  // To ensure branchNode1s' siblings have identical y-position
  const siblingGroups: { [parentId: string]: Node[] } = {};
  // Group branchNode1s by their parent node to adjust their positions later
  nodes.forEach((node) => {
    if (node.type === "branchNode1") {
      const parentId = edgeTargetToSourceMap.get(node.id);
      if (parentId) {
        if (!siblingGroups[parentId]) siblingGroups[parentId] = [];
        siblingGroups[parentId].push(node);
      }
    }
  });
  // Adjust the y-axis positions for sibling branchNode1s
  const adjustedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Get the width and height of the node
    const nodeDimension = nodeDimensionLookup[node.type as CustomNodeType] || {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    // If the node is a branchNode1 and it has siblings, adjust the y-position
    if (node.type === "branchNode1") {
      const parentId = edgeTargetToSourceMap.get(node.id);
      if (parentId && siblingGroups[parentId]) {
        // Get the parent node's position (we'll use this for the siblings' position)
        const parentNodePosition = dagreGraph.node(parentId);
        // Add space (height of two nodes) to the parent's y-position to prevent overlap
        const siblingXPosition = parentNodePosition.x + 120;
        // Assign the adjusted y-position to the current node
        nodeWithPosition.x = siblingXPosition;
      }
    }
    return {
      ...node,
      targetPosition: direction === "LR" ? Position.Left : Position.Top,
      sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeDimension.width / 2,
        y: nodeWithPosition.y - nodeDimension.height / 2,
      },
    };
  });
  return { nodes: adjustedNodes, edges };
};
/**
 * Custom hook that applies the Dagre auto layout algorithm to the nodes and edges of a graph.
 */
export const useDagreAutoLayout = () => {
  const { getNodes, getEdges } = useReactFlow();
  /** Organize the nodes and edges using the Dagre auto layout algorithm */
  const autoLayout = useCallback(
    (newNodesEdgesObj?: {
      newNodes: Node[];
      newEdges: Edge[];
    }): { nodes: Node[]; edges: Edge[] } => {
      const currentNodes = newNodesEdgesObj?.newNodes || getNodes();
      const currentEdges = newNodesEdgesObj?.newEdges || getEdges();
      const { layoutDirection } =
        useStudioPreferencesStore.getState().studioPreferences;
      const { setNodes, setEdges } = useReactFlowExtStore.getState();
      if (currentNodes.length === 0)
        return { nodes: currentNodes, edges: currentEdges };
      const visibleNodes = currentNodes
        .filter((node) => !node.hidden)
        .filter((n) => n.type !== "modelNode");
      // Filter edges where both source and target are visible
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
      const visibleEdges = currentEdges.filter(
        (edge) =>
          visibleNodeIds.has(edge.source) &&
          visibleNodeIds.has(edge.target) &&
          edge.targetHandle !== "for-loop-repeat", // filter loop-back edge
      );
      //  Layout only visible nodes and edges
      const { nodes: layoutedVisibleNodes } = getLayoutedElements(
        visibleNodes,
        visibleEdges,
        layoutDirection,
      );
      //  Create a map of layouted visible nodes
      const layoutedNodeMap = new Map(
        layoutedVisibleNodes.map((node) => [node.id, node]),
      );
      // Rebuild full nodes array in original order
      const allLayoutedNodes = currentNodes.map(
        (originalNode) =>
          layoutedNodeMap.has(originalNode.id)
            ? layoutedNodeMap.get(originalNode.id)! // Replace with layouted node
            : originalNode, // Keep hidden node untouched
      );
      const startPositions = currentNodes.map((node) => node.position);
      const endPositions = allLayoutedNodes.map((node) => node.position);
      const interpolatedNodes = allLayoutedNodes.map((node, index) => ({
        ...node,
        position: {
          x:
            startPositions[index]?.x +
            (endPositions[index]?.x - startPositions[index]?.x),
          y:
            startPositions[index]?.y +
            (endPositions[index]?.y - startPositions[index]?.y),
        },
      }));
      // Set the nodes with the interpolated positions
      setNodes(interpolatedNodes);
      if (newNodesEdgesObj?.newEdges) {
        setEdges(newNodesEdgesObj?.newEdges);
      }

      return {
        nodes: interpolatedNodes,
        edges: newNodesEdgesObj?.newEdges as Edge[],
      };
    },
    [getNodes, getEdges],
  );
  // Return the auto layout function
  return autoLayout;
};
