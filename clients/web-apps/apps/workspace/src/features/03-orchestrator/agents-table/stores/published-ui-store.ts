import { create } from "zustand";

type State = {
  viewDialogOpen: boolean;
  disableDialogOpen: boolean;
  uiBuilderProjectId: string;
  projectName: string;
  willEnable: boolean;
};

type Actions = {
  openViewDialog: (uiBuilderProjectId: string) => void;
  closeViewDialog: () => void;
  openDisableDialog: (uiBuilderProjectId: string, projectName: string, willEnable: boolean) => void;
  closeDisableDialog: () => void;
};

/**
 * Manages the open state of the Published UI builder dialogs.
 */
export const usePublishedUiStore = create<State & Actions>((set) => ({
  viewDialogOpen: false,
  disableDialogOpen: false,
  uiBuilderProjectId: "",
  projectName: "",
  willEnable: false,

  openViewDialog: (uiBuilderProjectId) => set({ uiBuilderProjectId, viewDialogOpen: true }),
  closeViewDialog: () => set({ viewDialogOpen: false }),
  openDisableDialog: (uiBuilderProjectId, projectName, willEnable) =>
    set({ uiBuilderProjectId, projectName, willEnable, disableDialogOpen: true }),
  closeDisableDialog: () => set({ disableDialogOpen: false }),
}));
