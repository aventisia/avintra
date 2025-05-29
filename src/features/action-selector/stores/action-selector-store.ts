import { ActionSelectorOriginType } from "@/types/action-selector-origin-type";
import { create } from "zustand";
import { PrimaryCategoryType } from "../types/primary-category-type";

type State = {
  actionSelectorData: PrimaryCategoryType[];

  /** Origin from where node selector popover is triggered */
  origin: ActionSelectorOriginType;

  /** Node or edge id from where action-selector popover is triggered. */
  originId: string;

  /** Selected primary category label */
  primaryCategoryLabel: string | null;

  /** Selected action category */
  actionCategory: string;

  /** Current step/Level of category */

  /** Serch query */
  query: string;
};

type Actions = {
  setActionSelectorData: (data: PrimaryCategoryType[]) => void;
  setOrigin: (origin: ActionSelectorOriginType, originId: string) => void;
  setPrimaryCategoryLabel: (primaryCategoryLabel: string | null) => void;
  setActionCategory: (actionCategory: string) => void;
  setQuery: (query: string) => void;
};

export const useNodeSelectorStore = create<State & Actions>((set) => ({
  actionSelectorData: [],
  origin: "plusFirstNode",
  originId: "",
  primaryCategoryLabel: null,
  actionCategory: "",
  query: "",

  setActionSelectorData: (data) =>
    set(() => ({
      actionSelectorData: data,
    })),

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

  setQuery: (query) => set(() => ({ query })),
}));
