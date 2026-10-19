import { create } from "zustand";

import { ActionSelectorOriginType } from "@/types/action-selector-origin-type";

import { PrimaryCategoryType } from "../types/primary-category-type";

type State = {
  showDialog: boolean;

  actionSelectorData: PrimaryCategoryType[];

  /** Origin from where node selector popover is triggered */
  origin: ActionSelectorOriginType;

  /** Node or edge id from where action-selector popover is triggered. */
  originId: string;

  /** Selected primary category label */
  primaryCategoryLabel: string | null;

  /** Selected action category */
  actionCategory: string;

  /**
   * Total custom-tool nodes (draggable actions across all active custom
   * tools, i.e. summed OpenAPI operations) fetched from the usable-tool
   * catalog at flow load. Drives the Custom Tools L1 count badge; null while
   * the catalog request is in flight.
   */
  customToolNodesCount: number | null;

  /** Current step/Level of category */

  /** Serch query */
  query: string;
};

type Actions = {
  setActionSelectorData: (data: PrimaryCategoryType[]) => void;
  setOrigin: (origin: ActionSelectorOriginType, originId: string) => void;
  setPrimaryCategoryLabel: (primaryCategoryLabel: string | null) => void;
  setActionCategory: (actionCategory: string) => void;
  setCustomToolNodesCount: (count: number | null) => void;
  setQuery: (query: string) => void;
  setShowDialog: (showDialog: boolean) => void;
};

export const useNodeSelectorStore = create<State & Actions>((set) => ({
  showDialog: false,
  actionSelectorData: [],
  origin: "plusFirstNode",
  originId: "",
  primaryCategoryLabel: null,
  actionCategory: "",
  customToolNodesCount: null,
  query: "",

  setShowDialog: (showDialog) => set({ showDialog }),

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

  setCustomToolNodesCount: (count) => set(() => ({ customToolNodesCount: count })),

  setQuery: (query) => set(() => ({ query })),
}));
