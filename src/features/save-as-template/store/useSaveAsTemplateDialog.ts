import { create } from "zustand";

interface SaveAsTemplateDialogState {
  isOpen: boolean;
  isFormDirty: boolean;
  setOpen: (open: boolean) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useSaveAsTemplateDialogStore = create<SaveAsTemplateDialogState>(
  (set) => ({
    isOpen: false,
    isFormDirty: false,
    setOpen: (open) => set({ isOpen: open }),
    toggleFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
  }),
);
