import { create } from "zustand";

import { NodeExecutionLogType } from "@/features/execute-flow/types/execution-log-types";

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
  setNodeStatus: (nodeId: string, status: LiveNodeStatus) => void;
  setNodeLog: (nodeId: string, log: NodeExecutionLogType) => void;
  markEdgeTraversed: (edgeId: string) => void;
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
  liveTraversedEdges: {},
  subflowProgressNodes: [],

  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      liveExecutionMap: { ...state.liveExecutionMap, [nodeId]: status },
    })),

  setNodeLog: (nodeId, log) =>
    set((state) => ({
      nodeLogsMap: { ...state.nodeLogsMap, [nodeId]: log },
    })),

  markEdgeTraversed: (edgeId) =>
    set((state) => ({
      liveTraversedEdges: { ...state.liveTraversedEdges, [edgeId]: true },
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
    set({
      liveExecutionMap: {},
      nodeLogsMap: {},
      liveTraversedEdges: {},
      subflowProgressNodes: [],
    }),
}));
