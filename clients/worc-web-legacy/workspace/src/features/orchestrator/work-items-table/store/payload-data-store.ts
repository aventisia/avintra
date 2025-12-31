import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";

type State = {
  isProcessing: boolean;
  payloadData?: Array<object>;
  currentWorkItem?: QueueWorkItemDto;
};

type Actions = {
  setIsProcessing: (isProcessing: boolean) => void;
  setPayloadData: (uploadedItems?: object[]) => void;
  setCurrentWorkItem: (currentWorkItem?: QueueWorkItemDto) => void;
};

export const usePayloadDataStore = create<State & Actions>()(
  subscribeWithSelector((set) => ({
    isProcessing: false,
    payloadData: [],

    setCurrentWorkItem: (currentWorkItem) => set({ currentWorkItem }),
    setPayloadData: (payloadData) => set({ payloadData }),
    setIsProcessing: (isProcessing) => set({ isProcessing }),
  })),
);
