import { Edge, Node } from "@xyflow/react";

export function findRightmostNodePosition(
  nodes: Node[],
  edges: Edge[],
  sourceId: string,
): { x: number; y: number; depth: number } | null {
  const sourceNode = nodes.find((node) => node.id === sourceId);
  if (!sourceNode || !("mergeBranchesNodeId" in sourceNode.data)) {
    return null;
  }

  const mergeNodeId = sourceNode.data.mergeBranchesNodeId as string;

  const edgeMap: Record<string, string[]> = {};
  for (const edge of edges) {
    if (!edgeMap[edge.source]) {
      edgeMap[edge.source] = [];
    }
    edgeMap[edge.source].push(edge.target);
  }

  const visited = new Set<string>();
  const nodeIdsInPath = new Set<string>();
  let maxDepth = 0;

  const dfs = (currentId: string, depth: number) => {
    if (visited.has(currentId)) return;
    visited.add(currentId);
    nodeIdsInPath.add(currentId);

    if (depth > maxDepth) maxDepth = depth;
    if (currentId === mergeNodeId) return;

    const children = edgeMap[currentId] || [];
    for (const child of children) {
      dfs(child, depth + 1);
    }
  };

  dfs(sourceId, 0);

  const nodesInPath = nodes.filter((node) => nodeIdsInPath.has(node.id));
  if (nodesInPath.length === 0) return null;

  // Safely grab the rightmost node by absolute X position
  const rightmostNode = nodesInPath.reduce((rightmost, current) =>
    (current.position?.x || 0) > (rightmost.position?.x || 0) ? current : rightmost,
  );

  return {
    x: rightmostNode.position.x,
    y: rightmostNode.position.y,
    depth: maxDepth,
  };
}
