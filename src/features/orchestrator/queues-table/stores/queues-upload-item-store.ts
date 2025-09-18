import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type State = {
  isProcessing: boolean;
  showDialog: boolean;
  rowId: string;
  uploadedItems?: Array<object>;
};

type Actions = {
  setIsProcessing: (isProcessing: boolean) => void;
  setShowDialog: (showDialog: boolean) => void;
  setRowId: (rowId: string) => void;
  setUploadedItems: (uploadedItems?: object[]) => void;
};

export const useQueueUploadItemsStore = create<State & Actions>()(
  subscribeWithSelector((set) => ({
    isProcessing: false,
    showDialog: false,
    uploadedItems: [],
    rowId: "",

    setUploadedItems: (uploadedItems) => set({ uploadedItems }),
    setIsProcessing: (isProcessing) => set({ isProcessing }),
    setShowDialog: (showDialog) => set({ showDialog }),
    setRowId: (rowId) => set({ rowId }),
  })),
);
