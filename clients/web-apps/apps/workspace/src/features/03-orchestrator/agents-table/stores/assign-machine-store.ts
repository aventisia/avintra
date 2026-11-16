import { create } from "zustand";

type State = {
  showDialog: boolean;
  flowVersionId: string;
  flowName: string;
  flowVersionNumber: number;
  supportedPlatform: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setFlowVersionId: (flowVersionId: string) => void;
  setFlowMetadata: (flowName: string, flowVersionNumber: number, supportedPlatform: string) => void;
};

/**
 * The agent version whose machines the assign machines dialog is editing.
 */
export const useAssignMachineStore = create<State & Actions>((set) => ({
  showDialog: false,
  flowVersionId: "",
  flowName: "",
  flowVersionNumber: 0,
  supportedPlatform: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setFlowVersionId: (flowVersionId) => set({ flowVersionId }),
  setFlowMetadata: (flowName, flowVersionNumber, supportedPlatform) =>
    set({ flowName, flowVersionNumber, supportedPlatform }),
}));
