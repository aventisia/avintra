import { create } from "zustand";

import { ExecutionActions, ExecutionState } from "../types/execution-log-types";
import { mapLogsToFlow } from "../utils/execution-log-parser";

export const useExecutionStore = create<ExecutionState & ExecutionActions>(
  (set) => ({
    executionMap: {},
    branchStats: {},
    loopRegistry: {},
    nodeToParentStack: {},
    activeIteration: {},
    routerConfig: {},
    routerVisits: {},
    routerTruePaths: {},
    showBranchStats: false,
    initLogs: (logs, nodes, edges) => {
      const data = mapLogsToFlow(logs, nodes, edges);
      console.log({ ...data });
      const indices: Record<string, number> = {};
      Object.keys(data.loopRegistry).forEach((id) => (indices[id] = 0));
      set({ ...data, activeIteration: indices });
    },

    setIteration: (id, idx) =>
      set((state) => ({
        activeIteration: { ...state.activeIteration, [id]: idx },
      })),
    toggleBranchStats: () =>
      set((state) => ({ showBranchStats: !state.showBranchStats })),
  }),
);
