import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Agents" | "Search";
  queueId: string;
  queueName: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Agents" | "Search") => void;
  setQueueId: (queueId: string) => void;
  setQueueName: (queueName: string) => void;
};

/**
 * Custom hook for managing the state and actions of the Queue search store.
 *
 * @returns An object containing the state and actions of the search store.
 */
export const useQueueAgentsStore = create<State & Actions>((set) => ({
  showDialog: false,
  view: "Agents",
  queueId: "",
  queueName: "",
  osId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
  setQueueId: (queueId) => set({ queueId }),
  setQueueName: (queueName) => set({ queueName }),
}));
