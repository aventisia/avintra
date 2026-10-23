import { create } from "zustand";

type State = {
  usersDialogOpen: boolean;
  viewDialogOpen: boolean;
  disableDialogOpen: boolean;
  uiBuilderProjectId: string;
  projectName: string;
  willEnable: boolean;
};

type Actions = {
  openUsersDialog: (uiBuilderProjectId: string) => void;
  closeUsersDialog: () => void;
  openViewDialog: (uiBuilderProjectId: string) => void;
  closeViewDialog: () => void;
  openDisableDialog: (uiBuilderProjectId: string, projectName: string, willEnable: boolean) => void;
  closeDisableDialog: () => void;
};

/**
 * Manages the open state of the Published UI builder dialogs.
 */
export const usePublishedUiStore = create<State & Actions>((set) => ({
  usersDialogOpen: false,
  viewDialogOpen: false,
  disableDialogOpen: false,
  uiBuilderProjectId: "",
  projectName: "",
  willEnable: false,

  openUsersDialog: (uiBuilderProjectId) => set({ uiBuilderProjectId, usersDialogOpen: true }),
  closeUsersDialog: () => set({ usersDialogOpen: false }),
  openViewDialog: (uiBuilderProjectId) => set({ uiBuilderProjectId, viewDialogOpen: true }),
  closeViewDialog: () => set({ viewDialogOpen: false }),
  openDisableDialog: (uiBuilderProjectId, projectName, willEnable) =>
    set({ uiBuilderProjectId, projectName, willEnable, disableDialogOpen: true }),
  closeDisableDialog: () => set({ disableDialogOpen: false }),
}));
