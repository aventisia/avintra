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
  nodeTypes: {},
  routerConfig: {},
  routerVisits: {},
  routerTruePaths: {},
  showBranchStats: false,
  initLogs: (logs, nodes, edges) => {
    const data = mapLogsToFlow(logs, nodes, edges);
    const indices: Record<string, number> = {};
    Object.keys(data.loopRegistry).forEach((id) => (indices[id] = 0));

    const nodeTypes: Record<string, string> = {};
    nodes?.forEach((n) => {
      nodeTypes[n.id] = n.type ?? "";
    });

    set({ ...data, activeIteration: indices, nodeTypes });
  },

  setIteration: (id, idx) =>
    set((state) => ({
      activeIteration: { ...state.activeIteration, [id]: idx },
    })),
  toggleBranchStats: () => set((state) => ({ showBranchStats: !state.showBranchStats })),
}));
