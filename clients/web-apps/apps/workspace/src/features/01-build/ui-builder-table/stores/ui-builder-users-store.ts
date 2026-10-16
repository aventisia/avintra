import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Users" | "Search";
  uiBuilderProjectId: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Users" | "Search") => void;
  setUiBuilderProjectId: (uiBuilderProjectId: string) => void;
};

/**
 * Manages the state of the UI builder project users assignment dialog.
 */
export const useUiBuilderUsersStore = create<State & Actions>((set) => ({
  showDialog: false,
  view: "Users",
  uiBuilderProjectId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
  setUiBuilderProjectId: (uiBuilderProjectId) => set({ uiBuilderProjectId }),
}));
