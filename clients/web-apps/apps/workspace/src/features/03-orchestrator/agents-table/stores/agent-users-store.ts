import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Users" | "Search";
  flowVersionId: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Users" | "Search") => void;
  setFlowVersionId: (flowVersionId: string) => void;
};

/**
 * Custom hook for managing the state and actions of the Queue search store.
 *
 * @returns An object containing the state and actions of the search store.
 */
export const useAgentUsersStore = create<State & Actions>((set) => ({
  showDialog: false,
  view: "Users",
  flowVersionId: "",
  osId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
  setFlowVersionId: (flowVersionId) => set({ flowVersionId }),
}));
