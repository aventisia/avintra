import { create } from "zustand";

type State = {
  showDialog: boolean;
  uiBuilderProjectId: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setUiBuilderProjectId: (uiBuilderProjectId: string) => void;
};

/**
 * Manages the state of the UI builder project users assignment dialog.
 */
export const useUiBuilderUsersStore = create<State & Actions>((set) => ({
  showDialog: false,
  uiBuilderProjectId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setUiBuilderProjectId: (uiBuilderProjectId) => set({ uiBuilderProjectId }),
}));
