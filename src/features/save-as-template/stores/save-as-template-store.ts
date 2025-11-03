import { create } from "zustand";

type State = {
  showDialog: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
};

export const useSaveAsTemplateStore = create<State & Actions>((set) => ({
  showDialog: false,
  validationStatus: [],

  setShowDialog: (showDialog) => set({ showDialog }),
}));
