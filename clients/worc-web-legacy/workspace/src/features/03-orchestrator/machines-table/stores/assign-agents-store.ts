import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Agents" | "Search";
  machineId: string;
  osID: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Agents" | "Search") => void;
  setMachineId: (machineId: string) => void;
  setOsID: (osID: string) => void;
};

/**
 * Custom hook for managing the state and actions of the Machine search store.
 *
 * @returns An object containing the state and actions of the search store.
 */
export const useAssignAgentsStore = create<State & Actions>((set) => ({
  showDialog: false,
  view: "Agents",
  machineId: "",
  osID: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
  setMachineId: (machineId) => set({ machineId }),
  setOsID: (osID) => set({ osID }),
}));
