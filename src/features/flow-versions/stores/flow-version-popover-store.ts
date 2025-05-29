import { create } from "zustand";

type State = {
  /** To manage popover open/close state */
  isPopoverOpen: boolean;
};

type Actions = {
  /** To toggle popover open/close state */
  togglePopoverOpen: (value?: boolean) => void;
};

/**
 * Custom hook for managing the state and actions of the  popover store.
 *
 * @returns An object containing the state and actions of the  popover store.
 */
export const useFlowVersionPopoverStore = create<State & Actions>((set) => ({
  isPopoverOpen: false,

  togglePopoverOpen: (value) =>
    set((state) => ({
      isPopoverOpen: typeof value === "boolean" ? value : !state.isPopoverOpen,
    })),
}));
