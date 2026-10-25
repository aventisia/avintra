import { create } from "zustand";

import { ExecutionActions, ExecutionState } from "../types/execution-log-types";
import { mapLogsToFlow } from "../utils/execution-log-parser";

export const useExecutionStore = create<ExecutionState & ExecutionActions>((set) => ({
  executionMap: {},
  executionHistoryMap: {},
  branchStats: {},
  loopRegistry: {},
  nodeToParentStack: {},
  activeIteration: {},
  activeCallerId: null,
  nodeTypes: {},
  routerConfig: {},
  traversedEdges: {},
  showBranchStats: false,
  initLogs: (logs, nodes, edges, callerId) => {
    const data = mapLogsToFlow(logs, nodes, edges, callerId);

    const nodeTypes: Record<string, string> = {};
    nodes?.forEach((n) => {
      nodeTypes[n.id] = n.type ?? "";
    });

    set((state) => {
      // Preserve the user's selected iteration for loops that still exist — e.g. when
      // navigating from the parent flow into a sub-flow invoked from inside that loop — and
      // clamp it to the newly computed total so a stale index can never point past the end.
      const indices: Record<string, number> = {};
      Object.entries(data.loopRegistry).forEach(([id, { total }]) => {
        const previous = state.activeIteration[id];
        indices[id] = typeof previous === "number" ? Math.min(previous, Math.max(0, total - 1)) : 0;
      });

      return { ...data, activeIteration: indices, nodeTypes };
    });
  },

  setIteration: (id, idx) =>
    set((state) => ({
      activeIteration: { ...state.activeIteration, [id]: idx },
    })),
  setCaller: (callerId) => set({ activeCallerId: callerId }),
  toggleBranchStats: () => set((state) => ({ showBranchStats: !state.showBranchStats })),
}));
