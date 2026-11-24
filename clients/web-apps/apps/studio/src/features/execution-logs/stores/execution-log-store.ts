import { JobStatusEnum } from "@avplatform/ui/enums";
import { create } from "zustand";

import { ExecutionActions, ExecutionState } from "../types/execution-log-types";
import { mapLogsToFlow } from "../utils/execution-log-parser";

const stoppedRunStatuses = [JobStatusEnum.Killed, JobStatusEnum.Aborted, JobStatusEnum.Failed];

export const useExecutionStore = create<ExecutionState & ExecutionActions>((set) => ({
  executionMap: {},
  executionHistoryMap: {},
  branchStats: {},
  loopRegistry: {},
  skippedLoops: {},
  nodeToParentStack: {},
  activeIteration: {},
  activeCallerId: null,
  nodeTypes: {},
  routerConfig: {},
  traversedEdges: {},
  stoppedAt: null,
  runStatus: null,
  showBranchStats: false,
  initLogs: (logs, nodes, edges, callerId) => {
    const data = mapLogsToFlow(logs, nodes, edges, callerId);

    const nodeTypes: Record<string, string> = {};
    nodes?.forEach((n) => {
      nodeTypes[n.id] = n.type ?? "";
    });

    set((state) => {
      // A loop opens on its last pass. While a Killed, Aborted or Failed run is being viewed,
      // a loop the run was inside parks on the pass where it stopped instead. A URL `li`
      // selection (already hydrated into the store) still wins.
      const stoppedIndices: Record<string, number> = {};
      const stoppedAt = data.stoppedAt;
      if (stoppedAt) {
        const parents = data.nodeToParentStack[stoppedAt.nodeId] ?? [];
        const pathIndices = stoppedAt.pathKey.split("-").map(Number);
        parents.forEach((loopId, i) => {
          if (Number.isFinite(pathIndices[i])) stoppedIndices[loopId] = pathIndices[i];
        });
      }
      const isStoppedRun = state.runStatus !== null && stoppedRunStatuses.includes(state.runStatus);

      const indices: Record<string, number> = {};
      Object.entries(data.loopRegistry).forEach(([id, { total }]) => {
        const lastPass = Math.max(0, total - 1);
        const previous = state.activeIteration[id];
        indices[id] =
          typeof previous === "number"
            ? Math.min(previous, lastPass)
            : isStoppedRun && stoppedIndices[id] !== undefined
              ? Math.min(stoppedIndices[id], lastPass)
              : lastPass;
      });

      // Keep the enclosing flow's loops when the loaded graph is a sub-flow; navigating back
      // must restore the pass the user was inspecting.
      return {
        ...data,
        activeIteration: { ...state.activeIteration, ...indices },
        nodeTypes,
      };
    });
  },

  setIteration: (id, idx) =>
    set((state) => ({
      activeIteration: { ...state.activeIteration, [id]: idx },
    })),
  resetIterations: () => set({ activeIteration: {} }),
  setCaller: (callerId) => set({ activeCallerId: callerId }),
  setRunStatus: (status) => set({ runStatus: status }),
  toggleBranchStats: () => set((state) => ({ showBranchStats: !state.showBranchStats })),
}));
