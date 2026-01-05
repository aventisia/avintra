import { create } from "zustand";

import { ExecutionNode } from "../types/execution-types";

type State = {
  /** Identifier for the selected action in the  */
  selectedNodeId: string | null;

  executions: ExecutionNode[];
};

type Actions = {
  /** Set the selected action id */
  setNodeId: (id: string) => void;

  setExecutions: (executions: ExecutionNode[]) => void;
};

/**
 * Custom hook for managing the state and actions of the execution log store.
 *
 * @returns An object containing the state and actions of the  execution log store.
 */
export const useExecutionLogStore = create<State & Actions>((set) => ({
  selectedNodeId: null,
  executions: [],

  setExecutions: (executions) => set({ executions }),
  setNodeId: (id) => set({ selectedNodeId: id }),
}));
