import { create } from "zustand";

type State = {
  /** To manage popover open/close state */
  isPopoverOpen: boolean;
};

type Actions = {
  /** To toggle popover open/close state */
  togglePopoverOpen: (value?: boolean) => void;
};

export const useActivitySelectorStore = create<State & Actions>((set) => ({
  isPopoverOpen: false,

  togglePopoverOpen: (value) =>
    set((state) => ({
      isPopoverOpen: typeof value === "boolean" ? value : !state.isPopoverOpen,
    })),
}));
