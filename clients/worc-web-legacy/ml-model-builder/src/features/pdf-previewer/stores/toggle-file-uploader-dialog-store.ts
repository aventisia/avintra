import { create } from "zustand";

interface TabState {
  showFileUploadDialog: boolean;
}

interface TabActions {
  setShowFileUploadDialog: (show: boolean) => void;
}

export const useToggleFileUploadDialogStore = create<TabState & TabActions>(
  (set) => ({
    showFileUploadDialog: false, // default state
    setShowFileUploadDialog: (show) => set({ showFileUploadDialog: show }),
  }),
);
