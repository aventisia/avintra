import { create } from "zustand";

type State = {
  /** Whether the "Set Fixed Credits" dialog is open. */
  showFixedCreditsDialog: boolean;
  flowVersionId: string;
};

type Actions = {
  setShowFixedCreditsDialog: (show: boolean) => void;
  setFlowVersionId: (flowVersionId: string) => void;
};

export const useTenantPublishedAgentsStore = create<State & Actions>((set) => ({
  showFixedCreditsDialog: false,
  flowVersionId: "",

  setShowFixedCreditsDialog: (show) => set({ showFixedCreditsDialog: show }),
  setFlowVersionId: (flowVersionId) => set({ flowVersionId }),
}));
