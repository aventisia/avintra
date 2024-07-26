import { create } from "zustand";
import { StudioTabType } from "../types/etlia-menu-type";

type State = {
  /** To set name of currently selected Tab of ETLIA menu */
  currentTab: StudioTabType;
};

type Actions = {
  /** To change state of currently selected ETLIA menu Tab */
  setCurrentTab: (newState: StudioTabType) => void;
};

export const useETLIAMenuStore = create<State & Actions>((set) => ({
  currentTab: "extract",
  setCurrentTab: (newState) => set({ currentTab: newState }),
}));
