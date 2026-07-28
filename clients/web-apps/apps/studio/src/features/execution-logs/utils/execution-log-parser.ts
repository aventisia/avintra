import { Edge, Node } from "@xyflow/react";

import { NodeExecutionLogType } from "../types/execution-log-types";

export const mapLogsToFlow = (
  logs: NodeExecutionLogType[],
  flowNodes: Node[],
  flowEdges: Edge[],
) => {
  const executionMap: Record<string, Record<string, NodeExecutionLogType>> = {};
  const executionHistoryMap: Record<
    string,
    Record<string, NodeExecutionLogType[]>
  > = {};
  const branchStats: Record<string, number> = {};
  const loopRegistry: Record<string, { total: number }> = {};
  const nodeToParentStack: Record<string, string[]> = {};

  const branchToRouterMap: Record<string, string> = {};
  const nodeToBranchMap: Record<string, string> = {}; // Required for invisible edge tracing
  const routerConfig: Record<
    string,
    { defaultId: string; conditionals: string[] }
  > = {};
  const routerVisits: Record<string, Set<string>> = {};
  const routerTruePaths: Record<string, Set<string>> = {};

  // 1. Map Structure (Purely via React Flow properties, ignoring user-editable names)
  flowNodes?.forEach((n) => {
    if (n.type === "conditionalNode") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = n.data as any;
      const defaultId = d.defaultBranchNodeId;
      const conditionals = (d.branches || []).filter(
        (id: string) => id !== defaultId,
      );

      routerConfig[n.id] = { defaultId, conditionals };
      routerVisits[n.id] = new Set();
      routerTruePaths[n.id] = new Set();

      [defaultId, ...conditionals]?.forEach((bid) => {
        branchToRouterMap[bid] = n.id;
      });
    }
  });

  // Safe mapping for structural nodes (resolves edges during aborts/fails)
  const findOwnerBranch = (
    targetId: string,
    visited = new Set<string>(),
  ): string | null => {
    if (visited.has(targetId) || visited.size > 50) return null;
    visited.add(targetId);
    const edge = flowEdges.find((e) => e.target === targetId);
    if (!edge) return null;
    if (branchToRouterMap[edge.source]) return edge.source;
    return findOwnerBranch(edge.source, visited);
  };

  flowNodes?.forEach((n) => {
    const owner = findOwnerBranch(n.id);
    if (owner) nodeToBranchMap[n.id] = owner;
  });

  // 2. Process Logs
  const stack: { id: string; idx: number }[] = [];

  logs.forEach((entry) => {
    const { nodeId, outputs } = entry; // nodeName completely ignored
    const node = flowNodes?.find((n) => n.id === nodeId);
    if (!node) return;

    // --- LOOP PROCESSING ---
    if (node.type === "forLoopNode") {
      // Loop exits purely determined by Output Engine Status, unaffected by UI node renames
      const isExiting =
        outputs?.ConditionsResult === "False" ||
        (typeof outputs?.Status === "string" &&
          outputs.Status.includes("No more items"));

      if (isExiting) {
        stack.pop();
      } else {
        const top = stack[stack.length - 1];
        if (top?.id === nodeId) top.idx++;
        else stack.push({ id: nodeId, idx: 0 });

        if (!loopRegistry[nodeId]) loopRegistry[nodeId] = { total: 0 };
        loopRegistry[nodeId].total = Math.max(
          loopRegistry[nodeId].total,
          stack[stack.length - 1].idx + 1,
        );
      }
    }

    const parentLoops =
      stack.length > 0 && stack[stack.length - 1].id === nodeId
        ? stack.slice(0, -1)
        : stack;

    const pathKey =
      parentLoops.length > 0
        ? parentLoops.map((s) => s.idx).join("-")
        : "global";

    if (!executionMap[nodeId]) executionMap[nodeId] = {};
    if (!executionHistoryMap[nodeId]) executionHistoryMap[nodeId] = {};
    if (!executionHistoryMap[nodeId][pathKey])
      executionHistoryMap[nodeId][pathKey] = [];

    executionHistoryMap[nodeId][pathKey].push(entry);
    executionMap[nodeId][pathKey] = entry;

    if (parentLoops.length > 0) {
      nodeToParentStack[nodeId] = parentLoops.map((s) => s.id);
    }

    // --- ROUTER INFERENCE ---
    const routerId = branchToRouterMap[nodeId];

    // If it's mapped to a Router, it IS a branch. No string includes("Branch") needed!
    if (routerId) {
      routerVisits[routerId].add(pathKey);

      // If it's a conditional branch evaluating to true
      if (outputs?.ConditionsResult === "True") {
        routerTruePaths[routerId].add(pathKey);
        branchStats[nodeId] = (branchStats[nodeId] || 0) + 1;
      }
    }
  });

  // 3. Mathematical Default Inference
  Object.entries(routerConfig)?.forEach(([routerId, config]) => {
    const totalRuns = routerVisits[routerId].size;
    const condHits = routerTruePaths[routerId].size;
    branchStats[config.defaultId] = Math.max(0, totalRuns - condHits);
  });

  return {
    executionMap,
    executionHistoryMap,
    branchStats,
    loopRegistry,
    nodeToParentStack,
    routerConfig,
    routerVisits,
    routerTruePaths,
    nodeToBranchMap,
  };
};
