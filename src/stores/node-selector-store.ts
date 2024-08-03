import { create } from "zustand";

type NodeSelectorOriginType = "Closed" | "FlowControls" | "OutputHandle";

type State = {
  /** Origin where node selector popover is placed and triggered. To manage popover open/close state */
  popoverOrigin: NodeSelectorOriginType;
};

type Actions = {
  /** To toggle popover open/close state */
  togglePopoverOrigin: (value: NodeSelectorOriginType) => void;
};

const useNodeSelectorStore = create<State & Actions>((set) => ({
  popoverOrigin: "Closed",

  togglePopoverOrigin: (value) => set({ popoverOrigin: value }),
}));

export { type NodeSelectorOriginType, useNodeSelectorStore };
