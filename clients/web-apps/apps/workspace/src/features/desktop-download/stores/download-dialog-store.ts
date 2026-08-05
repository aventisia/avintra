import { create } from "zustand";

type State = {
  /** To manage download dialog open/close state */
  isOpen: boolean;
};

type Actions = {
  /** To toggle download dialog open/close state */
  toggleOpen: (value?: boolean) => void;
};

export const useDownloadDialogStore = create<State & Actions>((set) => ({
  isOpen: false,

  toggleOpen: (value) =>
    set((state) => ({
      isOpen: typeof value === "boolean" ? value : !state.isOpen,
    })),
}));
