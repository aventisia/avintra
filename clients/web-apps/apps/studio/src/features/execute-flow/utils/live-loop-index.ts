import { Node } from "@xyflow/react";

import { NodeExecutionLogType } from "@/features/execute-flow/types/execution-log-types";

/**
 * Metadata-driven live execution index.
 *
 * Reconstructs loop paths directly from the flat node-log array using the executor-provided
 * `CallerReferenceId`, `LoopReferenceId` and `LoopIterationIndex` fields, instead of inferring
 * them from graph edges. This keeps sub-flow and nested-loop selection correct even when the
 * main flow and a sub-flow reuse the same node ids.
 */
export type LiveLoopIndex = {
  /** caller||nodeId -> pathKey -> log (pathKey is the joined iteration indices of the enclosing loops). */
  executionMap: Record<string, Record<string, NodeExecutionLogType>>;
  /** loopId -> total number of iterations observed. */
  loopRegistry: Record<string, { total: number }>;
  /** caller||nodeId -> ordered list of enclosing loop ids (outermost first). */
  nodeToParentStack: Record<string, string[]>;
  /** routerId -> default + conditional branch node ids. */
  routerConfig: Record<string, { defaultId: string; conditionals: string[] }>;
};

const toRecord = (entries?: Array<{ key: string; value: string }>): Record<string, string> =>
  Object.fromEntries((entries ?? []).map((entry) => [entry.key, entry.value]));

const scopeKey = (caller: string, nodeId: string) => `${caller || ""}||${nodeId}`;

/**
 * Builds a metadata-driven live execution index from the FULL flat log array.
 *
 * Loop tracking (stack/iteration) is derived from every log so it works even when the loop
 * node lives in the parent flow while the node being viewed lives in a sub-flow. Entries are
 * keyed by `caller||nodeId` so the main flow and a sub-flow can reuse the same node ids
 * without colliding.
 */
export const buildLiveLoopIndex = (logs: NodeExecutionLogType[], nodes: Node[]): LiveLoopIndex => {
  const executionMap: Record<string, Record<string, NodeExecutionLogType>> = {};
  const loopRegistry: Record<string, { total: number }> = {};
  const nodeToParentStack: Record<string, string[]> = {};
  const routerConfig: Record<string, { defaultId: string; conditionals: string[] }> = {};

  nodes.forEach((node) => {
    if (node.type !== "conditionalNode") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = node.data as any;
    const defaultId = data?.defaultBranchNodeId;
    const conditionals = (data?.branches || []).filter(
      (id: string) => id !== defaultId,
    );
    if (defaultId) routerConfig[node.id] = { defaultId, conditionals };
  });

  const stack: string[] = [];
  const currentIteration: Record<string, number> = {};
  // Loop ids whose exit/skip log was seen but whose merge node has not yet been recorded.
  const pendingClose: Record<string, boolean> = {};

  const record = (log: NodeExecutionLogType) => {
    const caller = log.callerReferenceId ?? "";
    const pathKey = stack.map((id) => currentIteration[id] ?? 0).join("-") || "global";
    const key = scopeKey(caller, log.nodeId);
    if (!executionMap[key]) executionMap[key] = {};
    executionMap[key][pathKey] = log;
    if (stack.length > 0) nodeToParentStack[key] = [...stack];
  };

  for (const log of logs) {
    const loopId = log.loopReferenceId;
    const outputs = toRecord(log.outputs);
    const status = outputs.LoopStatus;
    const caller = log.callerReferenceId ?? "";

    // Loop's own log: only loop nodes emit LoopStatus. Detected by the output, NOT by node
    // type, so it works even when the loop node lives in the parent flow while the node being
    // viewed lives in a sub-flow (the parent loop node is absent from the sub-flow's nodes).
    if (status !== undefined) {
      const key = scopeKey(caller, log.nodeId);
      const parentPath = stack.map((id) => currentIteration[id] ?? 0).join("-") || "global";
      if (!executionMap[key]) executionMap[key] = {};
      executionMap[key][parentPath] = log;
      if (stack.length > 0) nodeToParentStack[key] = [...stack];

      if (status === "exit" || status === "skip") {
        // Keep the loop on the stack so the following merge node is recorded under its path.
        if (loopId) pendingClose[loopId] = true;
      } else {
        if (loopId && stack[stack.length - 1] !== loopId) stack.push(loopId);
        if (loopId) {
          currentIteration[loopId] = log.loopIterationIndex ?? 0;
          if (!loopRegistry[loopId]) loopRegistry[loopId] = { total: 0 };
          loopRegistry[loopId].total = Math.max(
            loopRegistry[loopId].total,
            (log.loopIterationIndex ?? 0) + 1,
          );
        }
      }
      continue;
    }

    // Merge node: the first log after a loop exit that carries that loop's reference. Record
    // it under the loop path, then pop the loop.
    if (loopId && pendingClose[loopId]) {
      const key = scopeKey(caller, log.nodeId);
      const pathKey = stack.map((id) => currentIteration[id] ?? 0).join("-") || "global";
      if (!executionMap[key]) executionMap[key] = {};
      executionMap[key][pathKey] = log;
      if (stack.length > 0) nodeToParentStack[key] = [...stack];

      const idx = stack.lastIndexOf(loopId);
      if (idx >= 0) stack.splice(idx);
      delete pendingClose[loopId];
      continue;
    }

    record(log);
  }

  return { executionMap, loopRegistry, nodeToParentStack, routerConfig };
};

/** Builds the path key for a node using the currently selected loop iterations. */
export const getLivePathKey = (
  index: LiveLoopIndex,
  caller: string,
  nodeId: string,
  liveActiveIteration: Record<string, number>,
): string => {
  const parents = index.nodeToParentStack[scopeKey(caller, nodeId)] || [];
  if (parents.length === 0) return "global";
  return parents
    .map(
      (loopId) =>
        liveActiveIteration[loopId] ??
        Math.max(0, (index.loopRegistry[loopId]?.total ?? 1) - 1),
    )
    .join("-");
};

/** Resolves the log for a node under the active caller and selected loop iterations. */
export const getLiveNodeLog = (
  index: LiveLoopIndex,
  caller: string,
  nodeId: string,
  liveActiveIteration: Record<string, number>,
): NodeExecutionLogType | undefined => {
  const pathKey = getLivePathKey(index, caller, nodeId, liveActiveIteration);
  return index.executionMap[scopeKey(caller, nodeId)]?.[pathKey];
};
/**
 * Determines whether a router-to-branch edge was executed for the selected live path.
 * SwitchCase executes only the router's SelectedBranchId. NestedIfElse executes every
 * matching branch and the default branch, so its per-branch evaluation output is used.
 */
export const isLiveRouterBranchActive = (
  index: LiveLoopIndex,
  caller: string,
  routerId: string,
  branchId: string,
  liveActiveIteration: Record<string, number>,
): boolean => {
  const routerLog = getLiveNodeLog(index, caller, routerId, liveActiveIteration);
  if (!routerLog) return false;

  const outputs = toRecord(routerLog.outputs);
  const inputs = toRecord(routerLog.inputs);
  const mode = inputs.ConditionalMode || "SwitchCase";
  const selectedBranchId = outputs.SelectedBranchId;

  if (mode === "NestedIfElse") {
    const matched = outputs[`Branch_${branchId}_Matched`];
    return matched === "True" || matched === "default";
  }

  return selectedBranchId === branchId;
};

/**
 * Determines whether a branch node (conditional or default) was executed for the selected
 * live path, by locating the router that owns it and delegating to the router's selection.
 */
export const isLiveBranchNodeActive = (
  index: LiveLoopIndex,
  caller: string,
  branchId: string,
  liveActiveIteration: Record<string, number>,
): boolean => {
  for (const [routerId, config] of Object.entries(index.routerConfig)) {
    if (config.defaultId === branchId || config.conditionals.includes(branchId)) {
      return isLiveRouterBranchActive(index, caller, routerId, branchId, liveActiveIteration);
    }
  }
  return false;
};

/**
 * Structural node types that execute once per flow (or once per loop exit) and therefore do
 * not carry a per-iteration log. Their outgoing edges should be highlighted whenever the node
 * executed at all, not only when it has a log at the currently selected iteration path.
 */
const STRUCTURAL_NODE_TYPES = new Set([
  "triggerNode",
  "plusNode",
  "plusFirstNode",
  "mergeBranchesNode",
  "branchStartNode",
  "branchEndNode",
  "flowEndNode",
]);

/**
 * Returns true when the node has any log in the caller scope, regardless of the selected
 * iteration path. Used for structural nodes (merge/branchEnd/branchStart/trigger) whose log
 * is recorded once and not per iteration.
 */
export const hasLiveNodeLogAnyPath = (
  index: LiveLoopIndex,
  caller: string,
  nodeId: string,
): boolean => {
  const key = `${caller || ""}||${nodeId}`;
  const paths = index.executionMap[key];
  return !!paths && Object.keys(paths).length > 0;
};

/** Structural source nodes should be treated as executed when they have any log at all. */
export const isStructuralNode = (nodeType: string | undefined): boolean =>
  !!nodeType && STRUCTURAL_NODE_TYPES.has(nodeType);