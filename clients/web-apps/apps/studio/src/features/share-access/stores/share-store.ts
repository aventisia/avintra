import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Users" | "Search";
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Users" | "Search") => void;
};

/**
 * Custom hook for managing the state and actions of the flow search store.
 *
 * @returns An object containing the state and actions of the search store.
 */
export const useShareStore = create<State & Actions>((set) => ({
  showDialog: false,
  view: "Users",

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
}));
