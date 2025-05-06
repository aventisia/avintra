import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type State = {
  queueName: string;
};

type Actions = {
  setQueueName: (queueName: string) => void;
};

export const useUploadItemsStore = create<State & Actions>()(
  subscribeWithSelector((set) => ({
    queueName: "",

    setQueueName: (queueName) => set({ queueName }),
  })),
);
