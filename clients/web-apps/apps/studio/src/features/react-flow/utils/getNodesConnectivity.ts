import { Edge, Node } from "@xyflow/react";

export function areNodesConnected(selected: Node[], edges: Edge[]): boolean {
  if (selected.length < 2) return true;

  const selectedIds = new Set(selected.map((n) => n.id));
  const edgeMap: Record<string, string[]> = {};

  for (const edge of edges) {
    if (!edgeMap[edge.source]) edgeMap[edge.source] = [];
    edgeMap[edge.source].push(edge.target);
  }

  const visited = new Set<string>();
  const stack = [selected[0].id];

  while (stack.length) {
    const current = stack.pop()!;
    visited.add(current);

    const neighbors = edgeMap[current] || [];
    for (const neighbor of neighbors) {
      if (selectedIds.has(neighbor) && !visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return selected.every((n) => visited.has(n.id));
}
