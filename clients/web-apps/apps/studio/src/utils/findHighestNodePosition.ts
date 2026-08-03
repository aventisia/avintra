import { Edge, Node } from "@xyflow/react";

export function findHighestNodePosition(
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

  // FIX: Find the HIGHEST node (Minimum Y) to route above the flow
  const highestNode = nodesInPath.reduce((highest, current) =>
    (current.position?.y || 0) < (highest.position?.y || 0) ? current : highest,
  );

  return {
    x: highestNode.position.x,
    y: highestNode.position.y,
    depth: maxDepth,
  };
}
