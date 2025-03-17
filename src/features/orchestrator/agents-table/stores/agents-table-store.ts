import { create } from "zustand";
import type { AssignMachineDto } from "../dtos/assign-machine-dto";

type State = {

  /** machine id for agents */
  machineId: string | null;

  /** Query key for machine */
  agentsQueryKey: string[];

  isFetchinCurrentAgentMachines: boolean;

  allAssigned: boolean | "indeterminate";

  currentAgentMachines: AssignMachineDto[];
};

type Actions = {
  /** Set agents store state*/
  setAgentsState: (machineId: string) => void;

  setFetchinCurrentAgentMachines: (isfetching: boolean) => void;

  setCurrentAgentMachines: (machines: AssignMachineDto[]) => void;

  setIsAssigned: (machinesId: string, isAssigned: boolean) => void;

  setAllAssigned: (isAssigned: boolean | "indeterminate") => void;
};

export const useAgentsTableStore = create<State & Actions>((set) => ({
  machineId: null,
  agentsQueryKey: [],
  currentAgentMachines: [],
  isFetchinCurrentAgentMachines: false,
  allAssigned: false,

  setAgentsState: (machineId) =>
    set(() => ({
      machineId: machineId,
      agentsQueryKey: ["machine", machineId],
    })),

  setFetchinCurrentAgentMachines: (isFetching) =>
    set(() => ({
      isFetchinCurrentAgentMachines: isFetching,
    })),

  setCurrentAgentMachines: (machines) =>
    set(() => ({
      currentAgentMachines: machines
    })),

  setIsAssigned: (machinesId: string, isAssigned: boolean) => {
    set((state) => ({
      currentAgentMachines: state.currentAgentMachines.map(m => m.id === machinesId ? { ...m, isAssigned } : m)
    }))
  },

  setAllAssigned: (value: boolean | "indeterminate") => {
    set((state) => ({
      allAssigned: value,
      currentAgentMachines: state.currentAgentMachines.map((m) => ({
        ...m,
        isAssigned: typeof value === "string" ? m.isAssigned : value
      })).sort((a, b) =>
        (a.isAssigned && !b.isAssigned) ? -1 : (!a.isAssigned && b.isAssigned) ? 1 : a.name.localeCompare(b.name)),
    }))
  },

}));
