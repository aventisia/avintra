import { create } from "zustand";

type State = {
  showDialog: boolean;
  view: "Agents" | "Search";
  machineId: string;
  osId: string;
};

type Actions = {
  setShowDialog: (showDialog: boolean) => void;
  setView: (view: "Agents" | "Search") => void;
  setMachineId: (machineId: string) => void;
  setOsId: (osId: string) => void;
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
  osId: "",

  setShowDialog: (showDialog) => set({ showDialog }),
  setView: (view) => set({ view }),
  setMachineId: (machineId) => set({ machineId }),
  setOsId: (osId) => set({ osId }),
}));
