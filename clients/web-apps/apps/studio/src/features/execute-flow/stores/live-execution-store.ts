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
};

type LiveExecutionActions = {
  setNodeStatus: (nodeId: string, status: LiveNodeStatus) => void;
  setNodeLog: (nodeId: string, log: NodeExecutionLogType) => void;
  markEdgeTraversed: (edgeId: string) => void;
  resetLiveExecution: () => void;
};

export const useLiveExecutionStore = create<LiveExecutionState & LiveExecutionActions>((set) => ({
  liveExecutionMap: {},
  nodeLogsMap: {},
  liveTraversedEdges: {},

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

  resetLiveExecution: () => set({ liveExecutionMap: {}, nodeLogsMap: {}, liveTraversedEdges: {} }),
}));
