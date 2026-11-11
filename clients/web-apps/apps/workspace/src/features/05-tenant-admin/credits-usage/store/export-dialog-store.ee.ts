import { create } from "zustand";

interface ExportDialogState {
  isOpen: boolean;
  isFormDirty: boolean;
}

interface ExportDialogActions {
  setOpen: (open: boolean) => void;
  toggleFormDirty: (isDirty: boolean) => void;
}

export const useExportDialogStore = create<ExportDialogState & ExportDialogActions>((set) => ({
  isOpen: false,
  isFormDirty: false,
  setOpen: (open) => set({ isOpen: open }),
  toggleFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
}));
