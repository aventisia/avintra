import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";
import { LoopNodeDataType } from "@/types/loop-node-data-type";
import { NodeDataType } from "@/types/node-data-type";

import { Edge, Node } from "@xyflow/react";

/**
 * Support/placeholder node types that are not considered as executable nodes.
 * If a flow contains only these types of nodes, it will be treated as an empty flow.
 */
const SUPPORT_NODE_TYPES = new Set([
  "triggerNode",
  "plusNode",
  "plusFirstNode",
  "mergeBranchesNode",
  "branchStartNode",
  "branchNode1",
  "branchEndNode",
  "flowEndNode",
]);

/**
 * Check if the flow is empty by counting the number of executable nodes (nodes that are not
 * in the SUPPORT_NODE_TYPES list). If there are no executable nodes, the flow is considered empty.
 */
export const isEmptyFlow = (nodes: Node<NodeDataType>[]): boolean => {
  const executableNodeCount = nodes.filter(
    (node) => !SUPPORT_NODE_TYPES.has(node.type || ""),
  ).length;
  return executableNodeCount === 0;
};

/**
 * Determine if a flow contains desktop-only executable nodes based on their type and supported platforms.
 * Examples rejected: [windows], [linux], [windows, linux].
 * Examples allowed: [cloud, windows], [cloud], [cloud, linux], [cloud, windows, linux], [].
 * Note: If supportedPlatforms property is missing or empty, we will consider the node as cross-platform and allow it to be executed.
 */
export const doesFlowContainAnyDesktopOnlyNode = (
  nodes: Node<NodeDataType>[],
): boolean => {
  const desktopOnlyNodeCount = nodes.filter((node) => {
    // Skip support node types since they are not executable nodes
    if (SUPPORT_NODE_TYPES.has(node.type || "")) return false;

    // Skip if node is disabled
    if (node.data?.isDisabled === true) return false;

    // If supportedPlatforms is missing or empty or contains "cloud", consider the node executable on cloud
    const supportedPlatforms = node.data?.supportedPlatforms;
    return (
      supportedPlatforms &&
      supportedPlatforms.length > 0 &&
      !supportedPlatforms.includes("cloud")
    );
  }).length;

  return desktopOnlyNodeCount > 0;
};

/**
 * Resolve conditional branches for a conditional node.
 * Returns the list of branch entry node IDs.
 * TODO: Need to move this to a more appropriate file.
 */
const resolveConditionalBranches = (
  conditionalNode: Node<ConditionalNodeDataType>,
  edges: Edge[],
  mergeNodeId: string,
): string[] => {
  // First, try to get branches from node data
  const branchesFromNodeData =
    conditionalNode.data.branches?.filter(
      (b: string) =>
        b && b.trim() !== "" && b.toLowerCase() !== mergeNodeId.toLowerCase(),
    ) || [];

  if (branchesFromNodeData.length > 0) {
    return [...new Set(branchesFromNodeData)];
  }

  // Fallback: derive from edges
  return [
    ...new Set(
      edges
        .filter(
          (e) =>
            e.source === conditionalNode.id &&
            e.target.toLowerCase() !== mergeNodeId.toLowerCase(),
        )
        .map((e) => e.target)
        .filter((target) => target && target.trim() !== ""),
    ),
  ];
};

/**
 * Validates the structure of a React Flow graph.
 * Returns a string describing the validation error if the graph is invalid; otherwise, null if the graph is valid.
 */
export const isValidFlowGraph = (
  nodes: Node<NodeDataType>[],
  edges: Edge[],
): string | null => {
  if (nodes.length === 0) {
    return "Flow has no nodes.";
  }

  const nodeIdSet = new Set(nodes.map((n) => n.id.toLowerCase()));

  // Validate edges
  for (const edge of edges) {
    if (
      !edge.source ||
      edge.source.trim() === "" ||
      !edge.target ||
      edge.target.trim() === ""
    ) {
      return "Flow contains edge(s) with missing source or target.";
    }

    if (
      !nodeIdSet.has(edge.source.toLowerCase()) ||
      !nodeIdSet.has(edge.target.toLowerCase())
    ) {
      return `Flow contains dangling edge: '${edge.source}' -> '${edge.target}'.`;
    }
  }

  // Validate conditional nodes
  const conditionalNodes = nodes.filter(
    (n) => n.type?.toLowerCase() === "conditionalnode",
  ) as Node<ConditionalNodeDataType>[];

  for (const conditionalNode of conditionalNodes) {
    const mergeNodeId = conditionalNode.data.mergeBranchesNodeId;

    if (!mergeNodeId || mergeNodeId.trim() === "") {
      return `Conditional node '${conditionalNode.id}' is missing merge node id.`;
    }

    if (!nodeIdSet.has(mergeNodeId.toLowerCase())) {
      return `Conditional node '${conditionalNode.id}' has invalid merge node id '${mergeNodeId}'.`;
    }

    const branches = resolveConditionalBranches(
      conditionalNode,
      edges,
      mergeNodeId,
    );
    if (branches.length === 0) {
      return `Conditional node '${conditionalNode.id}' has no branch entry nodes.`;
    }
  }

  // Validate for loop nodes
  const forLoopNodes = nodes.filter(
    (n) => n.type?.toLowerCase() === "forloopnode",
  ) as Node<LoopNodeDataType>[];

  for (const loopNode of forLoopNodes) {
    const mergeNodeId = loopNode.data.mergeBranchesNodeId;

    if (!mergeNodeId || mergeNodeId.trim() === "") {
      return `For loop node '${loopNode.id}' is missing merge node id.`;
    }

    if (!nodeIdSet.has(mergeNodeId.toLowerCase())) {
      return `For loop node '${loopNode.id}' has invalid merge node id '${mergeNodeId}'.`;
    }

    const hasBodyEdge = edges.some(
      (e) =>
        e.source === loopNode.id &&
        e.target.toLowerCase() !== mergeNodeId.toLowerCase(),
    );

    if (!hasBodyEdge) {
      return `For loop node '${loopNode.id}' has no loop body entry edge.`;
    }
  }

  return null;
};
