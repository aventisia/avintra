import { Edge, Node } from "@xyflow/react";

export function getIntermediateNodeIds(
  nodes: Node[],
  edges: Edge[],
  conditionalNodeId: string,
): string[] {
  const conditionalNode = nodes.find((node) => node.id === conditionalNodeId);
  console.log(conditionalNode)
  if (!conditionalNode || conditionalNode.type !== "conditionalNode") {
    throw new Error("Provided ID does not belong to a conditionalNode");
  }

  const mergeNodeId = conditionalNode.data?.mergeBranchesNodeId;
  if (!mergeNodeId) {
    throw new Error("mergeBranchesNodeId not found in conditionalNode data");
  }

  // Map of source -> array of edges
  const edgeMap: Record<string, string[]> = {};
  for (const edge of edges) {
    if (!edgeMap[edge.source]) {
      edgeMap[edge.source] = [];
    }
    edgeMap[edge.source].push(edge.target);
  }

  // DFS to find all paths to mergeNodeId
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

  const immediateTargets = edgeMap[conditionalNodeId] || [];
  for (const target of immediateTargets) {
    dfs(target);
  }

  // Add the original conditional node and merge node
  result.add(conditionalNodeId);
  result.add(mergeNodeId as string);

  return Array.from(result);
}
