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
    layoutDirection: "LR",
    miniMap: true,
    undoRedo: true,
    cursorToggle: true,
    zoomControls: true,
    deleteAlert: true,
  },

  setStudioPreferences: (studioPreferences) =>
    set(() => ({
      studioPreferences,
    })),
}));
