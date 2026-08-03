import { Edge, Node } from "@xyflow/react";

/**
 * Collects all node IDs from a branch start node up to (but not including) the merge node.
 * Stops traversal at branch end nodes that connect directly to the merge node.
 */
export function getBranchSubgraphNodeIds(
  nodes: Node[],
  edges: Edge[],
  branchStartNodeId: string,
  mergeBranchesNodeId: string,
): string[] {
  const edgeMap: Record<string, string[]> = {};

  // Build an adjacency map for graph traversal
  for (const edge of edges) {
    if (!edgeMap[edge.source]) edgeMap[edge.source] = [];
    edgeMap[edge.source].push(edge.target);
  }

  const visited = new Set<string>();
  const result = new Set<string>();

  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    result.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    const hasEdgeToMerge = outgoingEdges.some((e) => e.target === mergeBranchesNodeId);

    // Stop at branchEndNode pointing to the merge node
    if (node.type === "branchEndNode" && hasEdgeToMerge) return;

    const children = edgeMap[nodeId] || [];
    for (const childId of children) {
      dfs(childId);
    }
  };

  // Start traversal from the branch start node
  dfs(branchStartNodeId);

  return Array.from(result);
}
