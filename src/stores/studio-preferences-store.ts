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
    layoutDirection: "TB",
    hideMiniMap: false,
    hideUndoRedo: false,
    hideIntractivityToggle: false,
    hideZoomControls: false,
    disableDeleteAlert: false,
  },

  setStudioPreferences: (studioPreferences) =>
    set(() => ({
      studioPreferences,
    })),
}));
