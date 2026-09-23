import { Edge, Node } from "@xyflow/react";

import { NodeExecutionLogType } from "../types/execution-log-types";

export const mapLogsToFlow = (
  logs: NodeExecutionLogType[],
  flowNodes: Node[],
  flowEdges: Edge[],
  /**
   * When viewing a sub-flow, the caller node (block/callAgent) whose invocation is being
   * inspected. Logs belonging to a DIFFERENT caller of the same sub-flow are skipped, so two
   * invocations of one sub-flow cannot overwrite each other's per-path logs.
   */
  callerId?: string | null,
) => {
  const executionMap: Record<string, Record<string, NodeExecutionLogType>> = {};
  const executionHistoryMap: Record<string, Record<string, NodeExecutionLogType[]>> = {};
  const branchStats: Record<string, number> = {};
  const loopRegistry: Record<string, { total: number }> = {};
  const nodeToParentStack: Record<string, string[]> = {};

  // Traversed edges, keyed by the TARGET node's pathKey — the same key the edge component
  // computes. Reconstructed from log adjacency: the executor appends one log per node in
  // traversal order, so two consecutive logs (A → B) mean the edge A→B was followed. This
  // mirrors the live canvas, which receives the exact traversed edge id from the runner.
  //
  // Keying by EDGE (not by target node) is essential: several edges can converge on the same
  // node — every branchEndNode points at the router's merge node — so a target-only check
  // lights up every converging edge as soon as the shared target runs.
  const traversedEdges: Record<string, Record<string, boolean>> = {};

  const branchToRouterMap: Record<string, string> = {};
  const routerConfig: Record<string, { defaultId: string; conditionals: string[] }> = {};

  // Loop metadata derived from the flow graph. This is only a fallback for legacy logs that
  // predate the loop-context migration (empty `loopReferenceId` / `-1` iteration index);
  // current logs carry authoritative loop context and do not need this inference.
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

  // 2. Process Logs
  // O(1) edge lookup by "source|target" so the traversal reconstruction below does not rescan
  // the edge list for every log entry.
  const edgeIdBySourceTarget: Record<string, string> = {};
  flowEdges?.forEach((e) => {
    edgeIdBySourceTarget[`${e.source}|${e.target}`] = e.id;
  });

  // Each entry walks through the flow. We maintain a stack of active loop contexts so that
  // repeated executions of the same node can be keyed by the iteration that produced them.
  const stack: { id: string; idx: number }[] = [];
  const iterationStarted: Record<string, boolean> = {};
  // Loops that entered or advanced during the current log entry must not have their
  // iteration marked as started by the end-of-entry pass; the body-start log of the new
  // iteration comes later and would otherwise advance the iteration a second time
  // (double-increment), which halves/alternates the visible logs and inflates the total.
  const justPushedLoops = new Set<string>();

  // Last node that produced a log AND exists in the loaded graph. Used to reconstruct the
  // traversed edge between consecutive logs. Nodes absent from the graph (sub-flow internals)
  // are skipped, so the previous valid node is retained across a sub-flow boundary — which is
  // exactly what we want, because the caller node's log is emitted when the sub-flow RETURNS
  // and the edge that entered the sub-flow is the one from that previous node.
  let previousNodeId: string | null = null;

  const updateLoopTotal = (loopId: string, idx: number) => {
    if (!loopRegistry[loopId]) loopRegistry[loopId] = { total: 0 };
    loopRegistry[loopId].total = Math.max(loopRegistry[loopId].total, idx + 1);
  };

  logs.forEach((entry) => {
    const { nodeId, outputs } = entry; // nodeName completely ignored
    const node = flowNodes?.find((n) => n.id === nodeId);

    // Scope to the selected caller when viewing a sub-flow. Sub-flow-internal logs carry the
    // caller node id, so this isolates one invocation from another invocation of the same
    // sub-flow. Top-level logs (empty caller) are unaffected when no caller is selected.
    const belongsToCaller = !callerId || (entry.callerReferenceId ?? "") === callerId;

    // A loop node's own log is recognised by its `LoopStatus` output rather than by node type,
    // so the enclosing-loop stack stays correct even when the loop node is NOT part of the
    // loaded graph — e.g. a sub-flow invoked from inside a loop, where the loop node lives in
    // the parent flow. Without this the outer loop context is dropped and every outer iteration
    // collapses onto the same pathKey (last-write-wins), so the node log never changes when the
    // outer iteration is switched.
    const isLoopLog = node?.type === "forLoopNode" || typeof outputs?.LoopStatus === "string";

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
    if (isLoopLog) {
      const loopStatus = outputs?.LoopStatus;
      const isExplicitExit = loopStatus === "exit" || loopStatus === "skip";
      const legacyExit =
        outputs?.ConditionsResult === "False" ||
        (typeof outputs?.Status === "string" && outputs.Status.includes("No more items"));

      // The loop node's own log carries the authoritative iteration index. Prefer it over the
      // order-based increment: a loop that runs a single iteration per outer pass (e.g. an
      // inner loop over a one-item list) emits `enter` with index 0 on EVERY outer pass, so
      // incrementing the stack would drift to 1, 2, … and the inner loop's body logs would be
      // keyed to a path the outer loop never selects.
      const ownIteration =
        typeof entry.loopIterationIndex === "number" && entry.loopIterationIndex >= 0
          ? entry.loopIterationIndex
          : null;

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
          top.idx = ownIteration ?? top.idx + 1;
        } else {
          stack.push({ id: nodeId, idx: ownIteration ?? 0 });
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

    // Mark every active loop as having started its current iteration, except loops that
    // were just pushed during this same entry (their body-start node comes next).
    stack.forEach((s) => {
      if (!justPushedLoops.has(s.id)) {
        iterationStarted[s.id] = true;
      }
    });
    justPushedLoops.clear();

    // Only logs that belong to the loaded graph AND the selected caller are recorded. The loop
    // bookkeeping above still ran for the others so enclosing loops stay in sync.
    if (!node || !belongsToCaller) return;

    // Resolve the parent loops for this node. The active loop itself is not its own parent.
    //
    // Prefer the authoritative loop context stamped by the executor (`loopReferenceId` +
    // `loopIterationIndex`). Unlike the order-based stack, it stays correct when the loop node
    // is NOT part of the currently loaded graph — e.g. a sub-flow invoked from inside a loop,
    // where the sub-flow's nodes inherit the parent loop's context but the loop node itself
    // lives in the parent flow. Legacy logs (pre loop-context migration) carry an empty id and
    // a `-1` index, and fall back to the stack inference below.
    const authoritativeLoopId =
      typeof entry.loopReferenceId === "string" ? entry.loopReferenceId : "";
    const authoritativeIteration =
      typeof entry.loopIterationIndex === "number" ? entry.loopIterationIndex : -1;
    const hasAuthoritativeLoop = authoritativeLoopId !== "" && authoritativeIteration >= 0;

    let parentLoops: { id: string; idx: number }[];
    if (hasAuthoritativeLoop) {
      if (authoritativeLoopId === nodeId) {
        // A loop node's own log is attributed to itself, so it is not its own parent. Its
        // enclosing loops are only known from the order-based stack. The total is NOT updated
        // from here: an exit log carries an already-incremented index (e.g. 3 for a 3-item
        // loop), which would inflate the total by one. The stack path below owns the total for
        // loop nodes.
        const activeLoopId = stack.length > 0 ? stack[stack.length - 1].id : null;
        parentLoops = activeLoopId === nodeId ? stack.slice(0, -1) : stack;
      } else {
        // A body node: the executor's iteration index is authoritative and, unlike the stack,
        // remains correct when the loop node is absent from the loaded graph (sub-flow in a loop).
        updateLoopTotal(authoritativeLoopId, authoritativeIteration);

        // NESTED LOOPS: the executor only reports the INNERMOST loop, so the outer loops must
        // still come from the stack. Reuse the stack's enclosing loops and override the
        // innermost entry with the authoritative index — this keeps the full `outer-inner`
        // pathKey (e.g. "1-0") instead of collapsing it to the inner loop alone.
        const stackTopIndex = stack.findIndex((s) => s.id === authoritativeLoopId);
        if (stackTopIndex >= 0) {
          parentLoops = stack.map((s, i) =>
            i === stackTopIndex ? { id: s.id, idx: authoritativeIteration } : s,
          );
        } else {
          // The loop is not on the stack at all (sub-flow invoked from inside a loop, where the
          // loop node lives in the parent flow). The authoritative loop is all we have.
          parentLoops = [{ id: authoritativeLoopId, idx: authoritativeIteration }];
        }
      }
    } else {
      const activeLoopId = stack.length > 0 ? stack[stack.length - 1].id : null;
      parentLoops = activeLoopId === nodeId ? stack.slice(0, -1) : stack;
    }

    const pathKey = parentLoops.length > 0 ? parentLoops.map((s) => s.idx).join("-") : "global";

    if (!executionMap[nodeId]) executionMap[nodeId] = {};
    if (!executionHistoryMap[nodeId]) executionHistoryMap[nodeId] = {};
    if (!executionHistoryMap[nodeId][pathKey]) executionHistoryMap[nodeId][pathKey] = [];

    executionHistoryMap[nodeId][pathKey].push(entry);
    executionMap[nodeId][pathKey] = entry;

    if (parentLoops.length > 0) {
      nodeToParentStack[nodeId] = parentLoops.map((s) => s.id);
    }

    // Record the edge that led into this node as traversed for this path. Only edges that
    // actually exist in the graph are recorded, so the synthetic caller log emitted when a
    // sub-flow returns cannot create a phantom edge.
    if (previousNodeId && previousNodeId !== nodeId) {
      const incomingEdgeId = edgeIdBySourceTarget[`${previousNodeId}|${nodeId}`];
      if (incomingEdgeId) {
        if (!traversedEdges[incomingEdgeId]) traversedEdges[incomingEdgeId] = {};
        traversedEdges[incomingEdgeId][pathKey] = true;
      }
    }
    previousNodeId = nodeId;

    // A branch start node is only ever logged when the router SELECTED it, so its incoming
    // edge (router → branch) is authoritative and can be recorded directly. This is required
    // in addition to the adjacency pass above because in NestedIfElse mode the router logs
    // once but dequeues several branches: the 2nd+ branch is reached from the previous
    // branch's END node, so the router → branch edge is never adjacent in the log stream.
    const owningRouterId = branchToRouterMap[nodeId];
    if (owningRouterId) {
      const routerEdgeId = edgeIdBySourceTarget[`${owningRouterId}|${nodeId}`];
      if (routerEdgeId) {
        if (!traversedEdges[routerEdgeId]) traversedEdges[routerEdgeId] = {};
        traversedEdges[routerEdgeId][pathKey] = true;
      }
    }
  });

  // 3. Branch hit counts
  // A branch node is only logged when the router actually selected it, so the number of
  // distinct paths it ran in IS its hit count. This is authoritative for both SwitchCase
  // (one branch per run) and NestedIfElse (several branches per run), and it counts the
  // default branch only when it actually ran — unlike the previous inference, which derived
  // the default count from `ConditionsResult` (a field only loop logs ever emit) and so
  // reported every conditional branch as 0 hits and the default branch as every run.
  Object.keys(executionMap).forEach((nodeId) => {
    if (branchToRouterMap[nodeId]) {
      branchStats[nodeId] = Object.keys(executionMap[nodeId]).length;
    }
  });

  return {
    executionMap,
    executionHistoryMap,
    branchStats,
    loopRegistry,
    nodeToParentStack,
    routerConfig,
    traversedEdges,
  };
};
