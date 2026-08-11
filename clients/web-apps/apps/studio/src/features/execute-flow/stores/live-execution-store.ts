import { create } from "zustand";

export type LiveNodeStatus = "running" | "success" | "failed";

type LiveExecutionState = {
  /**
   * Live status per node id, populated in real time by the local RunnerApp over the
   * Tauri WebSocket while a local (unpublished) flow is executing. "running" is pushed
   * when a node starts, then flipped to "success" or "failed" once it completes.
   */
  liveExecutionMap: Record<string, LiveNodeStatus>;
};

type LiveExecutionActions = {
  setNodeStatus: (nodeId: string, status: LiveNodeStatus) => void;
  resetLiveExecution: () => void;
};

export const useLiveExecutionStore = create<LiveExecutionState & LiveExecutionActions>((set) => ({
  liveExecutionMap: {},

  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      liveExecutionMap: { ...state.liveExecutionMap, [nodeId]: status },
    })),

  resetLiveExecution: () => set({ liveExecutionMap: {} }),
}));
