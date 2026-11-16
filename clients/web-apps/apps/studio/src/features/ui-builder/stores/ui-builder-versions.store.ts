import { create } from "zustand";

type State = {
  projectId: string;
  isPopoverOpen: boolean;
};

type Actions = {
  setProjectId: (projectId: string) => void;
  togglePopoverOpen: (value?: boolean) => void;
};

/** Shared state linking the header version control and the builder preview. */
export const useUiBuilderVersionsStore = create<State & Actions>((set) => ({
  projectId: "",
  isPopoverOpen: false,

  setProjectId: (projectId) => set({ projectId }),

  togglePopoverOpen: (value) =>
    set((state) => ({
      isPopoverOpen: typeof value === "boolean" ? value : !state.isPopoverOpen,
    })),
}));
