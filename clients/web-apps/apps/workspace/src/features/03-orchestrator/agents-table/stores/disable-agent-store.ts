import { create } from "zustand";

type State = {
  showDialog: boolean;
  flowVersionId: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setFlowVersionId: (flowVersionId: string) => void;
};

export const useDisableAgentStore = create<State & Actions>((set) => ({
  showDialog: false,
  flowVersionId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setFlowVersionId: (flowVersionId) => set({ flowVersionId }),
}));
