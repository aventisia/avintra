import { create } from "zustand";
import { SettingType } from "../types/setting-types";

type State = {
  settings: SettingType;
};

type Actions = {
  setSettings: (settings: SettingType) => void;
};

export const useSettingsStore = create<State & Actions>((set) => ({
  settings: {
    runDelay: 100,
  },

  setSettings: (settings) =>
    set(() => ({
      settings,
    })),
}));
