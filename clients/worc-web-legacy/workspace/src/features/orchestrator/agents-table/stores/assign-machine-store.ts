import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Machines" | "Search";
  flowVersionId: string;
  machineIds: string[];
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Machines" | "Search") => void;
  setFlowVersionId: (flowVersionId: string) => void;
  setMachineIds: (machineIds: string[]) => void;
};

/**
 * Custom hook for managing the state and actions of the Machine search store.
 *
 * @returns An object containing the state and actions of the search store.
 */
export const useAssignMachineStore = create<State & Actions>((set) => ({
  showDialog: false,
  view: "Machines",
  flowVersionId: "",
  machineIds: [],

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
  setFlowVersionId: (flowVersionId) => set({ flowVersionId }),
  setMachineIds: (machineIds) => set({ machineIds }),
}));
