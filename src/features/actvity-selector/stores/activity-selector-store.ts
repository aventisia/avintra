import { create } from "zustand";

type ActivitySelectorOriginType = "Closed" | "FlowControls";

type State = {
  /** Origin where activity selector popover is placed and triggered. To manage popover open/close state */
  popoverOrigin: ActivitySelectorOriginType;
};

type Actions = {
  /** To toggle popover open/close state */
  togglePopoverOrigin: (value: ActivitySelectorOriginType) => void;
};

const useActivitySelectorStore = create<State & Actions>((set) => ({
  popoverOrigin: "Closed",

  togglePopoverOrigin: (value) => set({ popoverOrigin: value }),
}));

export { type ActivitySelectorOriginType, useActivitySelectorStore };
