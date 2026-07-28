import { create } from "zustand";

type State = {
  /** Count of flows created by user */
  flowsCount: number;

  /** To manage popover open/close state */
  isPopoverOpen: boolean;
};

type Actions = {
  /** Set the count of flows */
  setFlowsCount: (count: number) => void;

  /** To toggle popover open/close state */
  togglePopoverOpen: (value?: boolean) => void;
};

/**
 * Custom hook for managing the state and actions of the flows popover store.
 *
 * @returns An object containing the state and actions of the flows popover store.
 */
export const useFlowsPopoverStore = create<State & Actions>((set) => ({
  flowsCount: 0,
  isPopoverOpen: false,

  setFlowsCount: (count) => set({ flowsCount: count }),

  togglePopoverOpen: (value) =>
    set((state) => ({
      isPopoverOpen: typeof value === "boolean" ? value : !state.isPopoverOpen,
    })),
}));
