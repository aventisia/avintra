import { create } from "zustand";

interface FileUploaderDialogState {
  showFileUploadDialog: boolean;
}

interface FileUploaderDialogActions {
  setShowFileUploadDialog: (show: boolean) => void;
}

export const useToggleFileUploadDialogStore = create<FileUploaderDialogState & FileUploaderDialogActions>((set) => ({
  showFileUploadDialog: false, // default state
  setShowFileUploadDialog: (show) => set({ showFileUploadDialog: show }),
}));
