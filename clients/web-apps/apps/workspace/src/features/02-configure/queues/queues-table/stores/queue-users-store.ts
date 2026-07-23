import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Users" | "Search";
  queueId: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Users" | "Search") => void;
  setQueueId: (queueId: string) => void;
};

/**
 * Custom hook for managing the state and actions of the Queue search store.
 *
 * @returns An object containing the state and actions of the search store.
 */
export const useQueueUsersStore = create<State & Actions>((set) => ({
  showDialog: false,
  view: "Users",
  queueId: "",
  osId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
  setQueueId: (queueId) => set({ queueId }),
}));
