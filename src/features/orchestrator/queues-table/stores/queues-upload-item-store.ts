import { subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";
type State = {
  isProcessing: boolean;
  showDialog: boolean;
};

type Actions = {
  setIsProcessing: (isProcessing: boolean) => void;
  setShowDialog: (showDialog: boolean) => void;
};

export const useQueueUploadItemsStore = create<State & Actions>()(
  subscribeWithSelector((set) => ({
    isProcessing: false,
    showDialog: false,

    setIsProcessing: (isProcessing) => set({ isProcessing }),
    setShowDialog: (showDialog) => set({ showDialog }),
  })),
);
