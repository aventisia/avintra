import { create } from "zustand";

type State = {
  showDialog: boolean;
  upload: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setUpload: (upload: boolean) => void;
};

const useImportStore = create<State & Actions>((set) => ({
  showDialog: false,
  upload: false,

  setShowDialog: (showDialog) => set({ showDialog }),
  setUpload: (upload) => set({ upload }),
}));

export { useImportStore };
