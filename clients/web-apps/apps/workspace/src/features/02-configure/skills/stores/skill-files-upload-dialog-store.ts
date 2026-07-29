import { create } from "zustand";

type State = {
  showDialog: boolean;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
};

const useSkillFilesDialogStore = create<State & Actions>((set) => ({
  showDialog: false,

  setShowDialog: (showDialog) => set({ showDialog }),
}));

export { useSkillFilesDialogStore };
