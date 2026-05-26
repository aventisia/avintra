import { create } from "zustand";

type State = {
  showDialog: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
};

/**
 * Custom hook for managing the state and actions of the flow search store.
 *
 * @returns An object containing the state and actions of the search store.
 */
export const useSearchStore = create<State & Actions>((set) => ({
  showDialog: false,

  setShowDialog: (showDialog) => set({ showDialog }),
}));
