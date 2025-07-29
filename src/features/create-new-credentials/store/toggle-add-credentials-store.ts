import { create } from "zustand";

interface CreateNewCredentialsState {
  showCreateNewCredentialsDialog: boolean;
  isFormDirty: boolean;
}

interface CreateNewCredentialsActions {
  setShowCreateNewCredentialsDialog: (show: boolean) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useToggleCreateNewCredentialsDialogStore = create<CreateNewCredentialsState & CreateNewCredentialsActions>((set) => ({
  showCreateNewCredentialsDialog: false, // default state
  isFormDirty: false,
  toggleFormDirty: (isDirty) => set({isFormDirty : isDirty}),
  setShowCreateNewCredentialsDialog: (show) => set({ showCreateNewCredentialsDialog: show }),
}));
