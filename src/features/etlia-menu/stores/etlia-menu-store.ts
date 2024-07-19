import { StudioTabType } from "@/features/etlia-menu";
import { create } from "zustand";

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
