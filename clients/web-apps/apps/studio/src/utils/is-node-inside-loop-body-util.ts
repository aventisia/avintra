import { Edge, Node } from "@xyflow/react";

export const isNodeInsideLoopBody = (nodeId: string, nodes: Node[], edges: Edge[]): boolean => {
  const loopNodes = nodes.filter((node) => node.type === "forLoopNode");

  for (const loopNode of loopNodes) {
    const mergeId = (loopNode.data as { mergeBranchesNodeId?: string } | undefined)
      ?.mergeBranchesNodeId;
    if (!mergeId) continue;

    const bodyStartId = edges.find(
      (edge) => edge.source === loopNode.id && edge.target !== mergeId,
    )?.target;
    if (!bodyStartId) continue;

    const visited = new Set<string>([bodyStartId]);
    const queue: string[] = [bodyStartId];
    while (queue.length > 0) {
      const current = queue.shift() as string;
      if (current === nodeId) return true;
      if (current === mergeId) continue;
      for (const edge of edges.filter((e) => e.source === current)) {
        if (!edge.target || visited.has(edge.target)) continue;
        visited.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  return false;
};
