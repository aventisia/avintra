import { ActionSelectorOriginType } from "@/types/action-selector-origin-type";
import { create } from "zustand";

type State = {
  /** Origin from where node selector popover is triggered */
  origin: ActionSelectorOriginType;

  /** Node or edge id from where action-selector popover is triggered. */
  originId: string;

  /** Selected primary category label */
  primaryCategoryLabel: string | null;

  /** Selected action category */
  actionCategory: string;

  /** Current step/Level of category */
};

type Actions = {
  setOrigin: (origin: ActionSelectorOriginType, originId: string) => void;
  setPrimaryCategoryLabel: (primaryCategoryLabel: string | null) => void;
  setActionCategory: (actionCategory: string) => void;
};

export const useNodeSelectorStore = create<State & Actions>((set) => ({
  origin: "plusFirstNode",
  originId: "",
  primaryCategoryLabel: null,
  actionCategory: "",

  setOrigin: (origin, originId) =>
    set(() => ({
      origin,
      originId,
    })),

  setPrimaryCategoryLabel: (primaryCategoryLabel) =>
    set(() => ({
      primaryCategoryLabel,
    })),

  setActionCategory: (actionCategory) =>
    set(() => ({
      actionCategory,
    })),
}));
