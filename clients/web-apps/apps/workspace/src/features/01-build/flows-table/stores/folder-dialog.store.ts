import { create } from "zustand";

import { FolderDialog } from "../types/folder-dialog.type";

type FolderDialogState = {
  dialog: FolderDialog | null;
  isOpen: boolean;
  openCount: number;
  openDialog: (dialog: FolderDialog) => void;
  closeDialog: () => void;
};

/**
 * Open folder dialog. The last dialog is kept after closing so its exit animation can play.
 */
export const useFolderDialogStore = create<FolderDialogState>((set) => ({
  dialog: null,
  isOpen: false,
  openCount: 0,
  openDialog: (dialog) =>
    set((state) => ({ dialog, isOpen: true, openCount: state.openCount + 1 })),
  closeDialog: () => set({ isOpen: false }),
}));
