import { create } from "zustand";

type State = {
  /** Unique identifier for the flow execution log */
  selectedExecutionId: string | null;

  /** Identifier for the selected action in the flow */
  selectedNodeId: string | null;

  showDialog: boolean;
};

type Actions = {
  /** Set the flow execution log id */
  setExecutionId: (id: string, nodes: { nodeId: string }[]) => void;

  /** Set the selected action id */
  setNodeId: (id: string) => void;

  resetSelections: (
    executions: {
      executionId: string;
      nodes: { nodeId: string; uniqueNodeId?: string }[];
    }[],
  ) => void;

  setShowDialog: (showDialog: boolean) => void;
};

/**
 * Custom hook for managing the state and actions of the flow execution log store.
 *
 * @returns An object containing the state and actions of the flow execution log store.
 */
export const useFlowExecutionLogStore = create<State & Actions>((set) => ({
  showDialog: false,
  selectedExecutionId: null,
  selectedNodeId: null,

  setShowDialog: (showDialog) => set({ showDialog }),

  setExecutionId: (id, nodes) => {
    set({
      selectedExecutionId: id,
      selectedNodeId: nodes[0]?.nodeId ?? null,
    });
  },

  setNodeId: (id) => set({ selectedNodeId: id }),

  resetSelections: (executions) => {
    if (executions.length > 0) {
      set({
        selectedExecutionId: executions[0].executionId,
        selectedNodeId:
          (executions[0].nodes[0]?.uniqueNodeId ||
            executions[0].nodes[0]?.nodeId) ??
          null,
      });
    }
  },
}));
