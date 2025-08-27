import { create } from "zustand";

interface FileUploaderDialogState {
  showFileUploadDialog: boolean;
  name?: string;
}

interface FileUploaderDialogActions {
  setShowFileUploadDialog: (show: boolean) => void;
  setName: (name: string) => void;
}

export const useToggleFileUploadDialogStore = create<
  FileUploaderDialogState & FileUploaderDialogActions
>((set) => ({
  showFileUploadDialog: false, // default state
  name: "",
  setShowFileUploadDialog: (show) => set({ showFileUploadDialog: show }),
  setName: (name) => set({ name: name }),
}));
