import { create } from "zustand";

type State = {
  showDialog: boolean;
  validationStatus: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setValidationStatus: (validationStatus: boolean) => void;
};

export const useSaveAsTemplateStore = create<State & Actions>((set) => ({
  showDialog: false,
  validationStatus: false,

  setShowDialog: (showDialog) => set({ showDialog }),
  setValidationStatus: (validationStatus) => set({ validationStatus }),
}));
