import { Edge, Node } from "@xyflow/react";

/**
 * Returns all intermediate node IDs between a branching node (conditional or for-loop)
 * and its merge node.
 */
export function getIntermediateNodeIds(
  nodes: Node[],
  edges: Edge[],
  branchingNodeId: string,
): string[] {
  const branchingNode = nodes.find((node) => node.id === branchingNodeId);
  if (!branchingNode || !("mergeBranchesNodeId" in branchingNode.data)) {
    throw new Error("mergeBranchesNodeId not found in node data");
  }

  const mergeNodeId = branchingNode.data?.mergeBranchesNodeId;

  const edgeMap: Record<string, string[]> = {};
  for (const edge of edges) {
    if (!edgeMap[edge.source]) {
      edgeMap[edge.source] = [];
    }
    edgeMap[edge.source].push(edge.target);
  }

  const visited = new Set<string>();
  const result = new Set<string>();

  const dfs = (currentNodeId: string) => {
    if (visited.has(currentNodeId)) return;
    visited.add(currentNodeId);

    if (currentNodeId === mergeNodeId) return;

    result.add(currentNodeId);

    const nextNodes = edgeMap[currentNodeId] || [];
    for (const nextNodeId of nextNodes) {
      dfs(nextNodeId);
    }
  };

  const immediateTargets = edgeMap[branchingNodeId] || [];
  for (const target of immediateTargets) {
    dfs(target);
  }

  result.add(branchingNodeId);
  result.add(mergeNodeId as string);

  return Array.from(result);
}
