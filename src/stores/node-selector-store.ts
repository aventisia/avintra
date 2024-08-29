import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";
import { create } from "zustand";

type State = {
  /** Origin from where node selector popover is triggered */
  origin: NodeSelectorOriginType;

  /** Node or edge id from where node-selector popover is triggered. */
  originId: string;
};

type Actions = {
  setOrigin: (origin: NodeSelectorOriginType, originId: string) => void;
};

export const useNodeSelectorStore = create<State & Actions>((set) => ({
  origin: "plusFirstNode",
  originId: "",

  setOrigin: (origin, originId) =>
    set(() => ({
      origin,
      originId,
    })),
}));
