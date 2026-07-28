import { create } from "zustand";

import { ExecutionSettings } from "../types/setting-types";

type State = {
  settings: ExecutionSettings;
};

type Actions = {
  setSettings: (settings: ExecutionSettings) => void;
};

export const useSettingsStore = create<State & Actions>((set) => ({
  settings: {
    maxExecutionTimeInMinutes: 10,
  },

  setSettings: (settings) =>
    set(() => ({
      settings,
    })),
}));
