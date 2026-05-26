import { create } from "zustand";

type State = {
  showDialog: boolean;
  type: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setType: (type: string) => void;
};

const useKBFilesDialogStore = create<State & Actions>((set) => ({
  showDialog: false,
  type: "file",

  setShowDialog: (showDialog) => set({ showDialog }),
  setType: (type) => set({ type }),
}));

export { useKBFilesDialogStore };
