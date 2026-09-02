import { Edge, Node } from "@xyflow/react";

import { NodeExecutionLogType } from "../types/execution-log-types";

export const mapLogsToFlow = (
  logs: NodeExecutionLogType[],
  flowNodes: Node[],
  flowEdges: Edge[],
) => {
  const executionMap: Record<string, Record<string, NodeExecutionLogType>> = {};
  const executionHistoryMap: Record<string, Record<string, NodeExecutionLogType[]>> = {};
  const branchStats: Record<string, number> = {};
  const loopRegistry: Record<string, { total: number }> = {};
  const nodeToParentStack: Record<string, string[]> = {};

  const branchToRouterMap: Record<string, string> = {};
  const nodeToBranchMap: Record<string, string> = {}; // Required for invisible edge tracing
  const routerConfig: Record<string, { defaultId: string; conditionals: string[] }> = {};
  const routerVisits: Record<string, Set<string>> = {};
  const routerTruePaths: Record<string, Set<string>> = {};

  // Loop metadata derived from the flow graph so we can detect iterations even when the
  // runner only logs the loop node once (the current backend behavior).
  const loopMergeNode: Record<string, string> = {};
  const loopBodyStart: Record<string, string> = {};
  const bodyStartToLoopId: Record<string, string> = {};

  const stringEquals = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

  // 1. Map Structure (Purely via React Flow properties, ignoring user-editable names)
  flowNodes?.forEach((n) => {
    if (n.type === "conditionalNode") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = n.data as any;
      const defaultId = d.defaultBranchNodeId;
      const conditionals = (d.branches || []).filter((id: string) => id !== defaultId);

      routerConfig[n.id] = { defaultId, conditionals };
      routerVisits[n.id] = new Set();
      routerTruePaths[n.id] = new Set();

      [defaultId, ...conditionals]?.forEach((bid) => {
        branchToRouterMap[bid] = n.id;
      });
    }

    if (n.type === "forLoopNode") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = n.data as any;
      const mergeId = d?.mergeBranchesNodeId;
      if (mergeId) {
        loopMergeNode[n.id] = mergeId;
        const bodyEdge = flowEdges?.find(
          (e) =>
            e.source === n.id && e.target !== mergeId && !stringEquals(e.type ?? "", "loopBack"),
        );
        if (bodyEdge) {
          loopBodyStart[n.id] = bodyEdge.target;
          bodyStartToLoopId[bodyEdge.target] = n.id;
        }
      }
    }
  });

  // Safe mapping for structural nodes (resolves edges during aborts/fails)
  const findOwnerBranch = (targetId: string, visited = new Set<string>()): string | null => {
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
  // Each entry walks through the flow. We maintain a stack of active loop contexts so that
  // repeated executions of the same node can be keyed by the iteration that produced them.
  const stack: { id: string; idx: number }[] = [];
  const iterationStarted: Record<string, boolean> = {};
  // Loops that entered or advanced during the current log entry must not have their
  // iteration marked as started by the end-of-entry pass; the body-start log of the new
  // iteration comes later and would otherwise advance the iteration a second time
  // (double-increment), which halves/alternates the visible logs and inflates the total.
  const justPushedLoops = new Set<string>();

  const updateLoopTotal = (loopId: string, idx: number) => {
    if (!loopRegistry[loopId]) loopRegistry[loopId] = { total: 0 };
    loopRegistry[loopId].total = Math.max(loopRegistry[loopId].total, idx + 1);
  };

  logs.forEach((entry) => {
    const { nodeId, outputs } = entry; // nodeName completely ignored
    const node = flowNodes?.find((n) => n.id === nodeId);
    if (!node) return;

    // --- LOOP EXIT PROCESSING ---
    // Pop any loops whose merge node is the current node. This handles both the legacy
    // pattern (loop node logged once, body repeats) and future explicit loop-exit logs.
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (loopMergeNode[top.id] === nodeId) {
        stack.pop();
        iterationStarted[top.id] = false;
      } else {
        break;
      }
    }

    // --- LOOP NODE PROCESSING ---
    if (node.type === "forLoopNode") {
      const loopStatus = outputs?.LoopStatus;
      const isExplicitExit = loopStatus === "exit" || loopStatus === "skip";
      const legacyExit =
        outputs?.ConditionsResult === "False" ||
        (typeof outputs?.Status === "string" && outputs.Status.includes("No more items"));

      if (isExplicitExit || legacyExit) {
        // Exit the loop if it is currently on top of the stack.
        if (stack.length > 0 && stack[stack.length - 1].id === nodeId) {
          stack.pop();
          iterationStarted[nodeId] = false;
        }
      } else {
        // Enter or continue the loop. If the loop is already active, advance to the next
        // iteration; otherwise start the first iteration.
        const top = stack[stack.length - 1];
        if (top?.id === nodeId) {
          top.idx++;
        } else {
          stack.push({ id: nodeId, idx: 0 });
        }
        // A loop log means the new iteration has not produced any body logs yet — guard it
        // so the end-of-entry pass does not mark it as started (that would cause the next
        // body-start log to advance the iteration again).
        justPushedLoops.add(nodeId);
        iterationStarted[nodeId] = false;
        updateLoopTotal(nodeId, stack[stack.length - 1].idx);
      }
    }

    // --- LOOP BODY RE-ENTRY PROCESSING ---
    // Legacy backend data logs the loop node only once. When the body-start node appears
    // again after its merge node, it signals a new iteration. We also handle the case where
    // the loop node log is omitted entirely by pushing the loop context from the body start.
    const reenteredLoopId = bodyStartToLoopId[nodeId];
    if (reenteredLoopId) {
      const top = stack[stack.length - 1];
      if (top?.id === reenteredLoopId) {
        if (iterationStarted[reenteredLoopId]) {
          top.idx++;
          updateLoopTotal(reenteredLoopId, top.idx);
        }
      } else {
        stack.push({ id: reenteredLoopId, idx: 0 });
        updateLoopTotal(reenteredLoopId, 0);
      }
      // The new iteration's body logs follow this entry — guard against double-increment.
      justPushedLoops.add(reenteredLoopId);
      iterationStarted[reenteredLoopId] = false;
    }

    // Resolve the parent loops for this node. The active loop itself is not its own parent.
    const activeLoopId = stack.length > 0 ? stack[stack.length - 1].id : null;
    const parentLoops = activeLoopId === nodeId ? stack.slice(0, -1) : stack;

    const pathKey = parentLoops.length > 0 ? parentLoops.map((s) => s.idx).join("-") : "global";

    if (!executionMap[nodeId]) executionMap[nodeId] = {};
    if (!executionHistoryMap[nodeId]) executionHistoryMap[nodeId] = {};
    if (!executionHistoryMap[nodeId][pathKey]) executionHistoryMap[nodeId][pathKey] = [];

    executionHistoryMap[nodeId][pathKey].push(entry);
    executionMap[nodeId][pathKey] = entry;

    if (parentLoops.length > 0) {
      nodeToParentStack[nodeId] = parentLoops.map((s) => s.id);
    }

    // Mark every active loop as having started its current iteration, except loops that
    // were just pushed during this same entry (their body-start node comes next).
    stack.forEach((s) => {
      if (!justPushedLoops.has(s.id)) {
        iterationStarted[s.id] = true;
      }
    });
    justPushedLoops.clear();

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
