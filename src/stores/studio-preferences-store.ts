import { StudioPreferencesType } from "@/react-toolkit/types/user-preferences-type";
import { create } from "zustand";

type State = {
  studioPreferences: StudioPreferencesType;
};

type Actions = {
  setStudioPreferences: (studioPreferences: StudioPreferencesType) => void;
};

export const useStudioPreferencesStore = create<State & Actions>((set) => ({
  studioPreferences: {
    layoutDirection: "Top to Bottom",
    enableAutoArrange: false,
    showMiniMap: true,
    showUndoRedo: true,
    showIntractivityToggle: true,
    showZoomControls: true,
    enableDeleteAlert: true,
  },

  setStudioPreferences: (studioPreferences) =>
    set(() => ({
      studioPreferences,
    })),
}));
