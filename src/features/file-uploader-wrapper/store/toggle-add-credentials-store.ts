import { create } from "zustand";

interface AddCredentailsState {
  cloudServiceName: string;
  isFormDirty: boolean;
  showAddCredentailsDialog: boolean;
}

interface AddCredentailsActions {
  setShowAddCredentailsDialog: (show: boolean) => void;
  setCloudServiceName: (name: string) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useToggleCredentailsDialogStore = create<AddCredentailsState & AddCredentailsActions>((set) => ({
    showAddCredentailsDialog: false, // default state
    cloudServiceName: "",
    isFormDirty: false,
    setShowAddCredentailsDialog: (show) => set({ showAddCredentailsDialog: show }),
    setCloudServiceName: (name) =>set({ cloudServiceName: name }),
    toggleFormDirty: (isDirty) => set({isFormDirty : isDirty})
}));
