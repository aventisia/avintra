import { Node } from "@xyflow/react";
import { create } from "zustand";

import { NodeExecutionLogType } from "@/features/execute-flow/types/execution-log-types";
import { buildLiveLoopIndex } from "@/features/execute-flow/utils/live-loop-index";
import type { LiveLoopIndex } from "@/features/execute-flow/utils/live-loop-index";

export type LiveNodeStatus = "running" | "success" | "failed";

type LiveExecutionState = {
  /**
   * Live status per node id, populated in real time by the local RunnerApp over the
   * Tauri WebSocket while a local (unpublished) flow is executing. "running" is pushed
   * when a node starts, then flipped to "success" or "failed" once it completes.
   */
  liveExecutionMap: Record<string, LiveNodeStatus>;

  /**
   * Full per-node execution logs (inputs, outputs, duration, retry attempt, etc.)
   * captured from the RunnerApp. Used by CanvasNodeDetailPanel to render a JobView-style
   * execution log panel for the selected node.
   */
  nodeLogsMap: Record<string, NodeExecutionLogType>;

  /** Every completed log in execution order, including repeated loop iterations. */
  nodeLogHistory: NodeExecutionLogType[];
  liveActiveIteration: Record<string, number>;

  /**
   * The current canvas graph nodes, mirrored from `useReactFlowExtStore` so the live
   * execution index can be computed in a single place (this store) instead of being
   * rebuilt inside every node/edge component. Stable during a run; changes only when the
   * graph is edited or the user navigates into a sub-flow.
   */
  nodes: Node[];

  /**
   * Pre-computed live execution index (loop paths, router config, per-node logs). Rebuilt
   * once per store update (in `applyBatch`/`setNodeLogHistory`/`setNodes`) rather than
   * inside every node/edge component, so all consumers share a single derived value.
   */
  liveLoopIndex: LiveLoopIndex;

  /**
   * Set of edge ids that the runner explicitly traversed. This is the authoritative source
   * for live path highlighting; an edge is only green if the executor actually followed it.
   */
  liveTraversedEdges: Record<string, boolean>;

  /**
   * Ordered list of node *metadata* currently being executed inside a sub-flow (block /
   * call-agent) whose internal nodes are NOT present in the loaded canvas. The engine still
   * reports their `running` progress over the WS, so we collect this metadata here to surface
   * "Processing: <name>" (plus id/type) on the active sub-flow caller node without
   * auto-navigating into it. Cleared when the sub-flow finishes.
   */
  subflowProgressNodes: SubflowProgressNode[];
};

export type SubflowProgressNode = {
  /** The sub-flow-internal node id. */
  nodeId: string;
  /** Friendly display name (node label). */
  nodeName: string;
  /** Unique class/type name (e.g. "GenerateRandomNumberNode"). */
  nodeType: string;
};

type LiveExecutionActions = {
  /**
   * Applies many node status/log updates in a single store update (see implementation).
   * `log` is optional so a `running` transition can be batched alongside completions.
   */
  applyBatch: (
    updates: Array<{ nodeId: string; status: LiveNodeStatus; log?: NodeExecutionLogType }>,
  ) => void;
  setNodeLogHistory: (logs: NodeExecutionLogType[]) => void;
  setLiveIteration: (loopId: string, index: number) => void;
  markEdgeTraversed: (edgeId: string) => void;
  /** Mirrors the current canvas nodes so the live index can be computed in this store. */
  setNodes: (nodes: Node[]) => void;
  resetLiveExecution: () => void;
  /** Append a sub-flow-internal node that started running. */
  pushSubflowProgressNode: (node: SubflowProgressNode) => void;
  /** Remove a sub-flow-internal node that finished running. */
  popSubflowProgressNode: (nodeId: string) => void;
  clearSubflowProgress: () => void;
};

export const useLiveExecutionStore = create<LiveExecutionState & LiveExecutionActions>((set) => ({
  liveExecutionMap: {},
  nodeLogsMap: {},
  nodeLogHistory: [],
  liveActiveIteration: {},
  liveTraversedEdges: {},
  subflowProgressNodes: [],
  nodes: [],
  liveLoopIndex: buildLiveLoopIndex([], []),

  /**
   * Applies many node status/log updates in a SINGLE store update. The WebSocket handler
   * buffers per-node progress messages and flushes them once per animation frame, so a burst
   * of completions (e.g. the tail of a 100+ node flow) produces one `set()` and one re-render
   * cascade instead of one per node. Dedupe is done in a single O(N+M) pass (one filter over
   * the existing history + one append of all new logs) rather than O(N) per node.
   */
  applyBatch: (updates) =>
    set((state) => {
      if (updates.length === 0) return state;

      const liveExecutionMap = { ...state.liveExecutionMap };
      const nodeLogsMap = { ...state.nodeLogsMap };

      const newLogs = updates
        .filter((u) => u.log !== undefined)
        .map((u) => u.log as NodeExecutionLogType);
      const newIds = new Set(newLogs.map((log) => log.nodeExecutionId));

      const nodeLogHistory =
        newLogs.length > 0
          ? [
              ...state.nodeLogHistory.filter((entry) => !newIds.has(entry.nodeExecutionId)),
              ...newLogs,
            ]
          : state.nodeLogHistory;

      for (const { nodeId, status, log } of updates) {
        liveExecutionMap[nodeId] = status;
        if (log) nodeLogsMap[nodeId] = log;
      }

      return {
        liveExecutionMap,
        nodeLogsMap,
        nodeLogHistory,
        liveLoopIndex: buildLiveLoopIndex(nodeLogHistory, state.nodes),
      };
    }),

  setNodeLogHistory: (logs) =>
    set((state) => ({
      nodeLogsMap: Object.fromEntries(logs.map((log) => [log.nodeId, log])),
      nodeLogHistory: logs,
      liveLoopIndex: buildLiveLoopIndex(logs, state.nodes),
    })),

  setLiveIteration: (loopId, index) =>
    set((state) => ({
      liveActiveIteration: { ...state.liveActiveIteration, [loopId]: index },
    })),

  markEdgeTraversed: (edgeId) =>
    set((state) => ({
      liveTraversedEdges: { ...state.liveTraversedEdges, [edgeId]: true },
    })),

  setNodes: (nodes) =>
    set((state) => ({
      nodes,
      liveLoopIndex: buildLiveLoopIndex(state.nodeLogHistory, nodes),
    })),

  pushSubflowProgressNode: (node) =>
    set((state) =>
      state.subflowProgressNodes.some((n) => n.nodeId === node.nodeId)
        ? state
        : { subflowProgressNodes: [...state.subflowProgressNodes, node] },
    ),

  popSubflowProgressNode: (nodeId) =>
    set((state) => ({
      subflowProgressNodes: state.subflowProgressNodes.filter((n) => n.nodeId !== nodeId),
    })),

  clearSubflowProgress: () => set({ subflowProgressNodes: [] }),

  resetLiveExecution: () =>
    set((state) => ({
      liveExecutionMap: {},
      nodeLogsMap: {},
      nodeLogHistory: [],
      liveActiveIteration: {},
      liveTraversedEdges: {},
      subflowProgressNodes: [],
      liveLoopIndex: buildLiveLoopIndex([], state.nodes),
    })),
}));
