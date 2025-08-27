// stores/usePublishDialogStore.ts
import { create } from "zustand";

interface CreateNewApiKeyDialogState {
  isOpen: boolean;
  isFormDirty: boolean;
  setOpen: (open: boolean) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useCreateNewApiKeyDialogStore = create<CreateNewApiKeyDialogState>(
  (set) => ({
    isOpen: false,
    isFormDirty: false,
    setOpen: (open) => set({ isOpen: open }),
    toggleFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
  }),
);
