import { create } from "zustand";

type State = {
  /** Unique identifier for the flow execution log */
  flowExecutionLogId: string | null;

  /** Identifier for the selected action in the flow */
  selectedActionId: string | null;
};

type Actions = {
  /** Set the flow execution log id */
  setFlowExecutionLogId: (flowExecutionLogId: string | null) => void;

  /** Set the selected action id */
  setSelectedActionId: (selectedActionId: string | null) => void;
};

/**
 * Custom hook for managing the state and actions of the flow execution log store.
 *
 * @returns An object containing the state and actions of the flow execution log store.
 */
export const useFlowExecutionLogStore = create<State & Actions>((set) => ({
  flowExecutionLogId: null, // Initial state for flowExecutionLogId
  selectedActionId: "", // Initial state for selectedActionId

  /**
   * Action to update the flow execution log id.
   *
   * @param flowExecutionLogId The new flow execution log id
   */
  setFlowExecutionLogId: (flowExecutionLogId) =>
    set(() => ({
      flowExecutionLogId, // Update flowExecutionLogId in the state
    })),

  /**
   * Action to update the selected action id.
   *
   * @param selectedActionId The new selected action id
   */
  setSelectedActionId: (selectedActionId) =>
    set(() => ({
      selectedActionId, // Update selectedActionId in the state
    })),
}));
