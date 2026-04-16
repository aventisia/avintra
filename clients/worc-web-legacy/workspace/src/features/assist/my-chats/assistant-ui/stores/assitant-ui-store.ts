import { create } from "zustand";

type ThreadConfigState = {
  readOnly: boolean;
  archived: boolean;
  setConfig: (config: Partial<Omit<ThreadConfigState, "setConfig">>) => void;
};

export const useThreadConfigStore = create<ThreadConfigState>((set) => ({
  readOnly: false,
  archived: false,
  setConfig: (config) => set(config),
}));
