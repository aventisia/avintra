import { create } from "zustand";

import type { AssignMachineDto } from "../dtos/assign-machine-dto";

type State = {
  /** machine id for agents */
  machineId: string | null;

  /** Query key for machine */
  agentsQueryKey: string[];

  isFetching: boolean;

  isReadOnly: boolean;

  allAssigned: boolean | "indeterminate";

  availableLicenses: number;

  currentMachines: AssignMachineDto[];
};

type Actions = {
  /** Set agents store state*/
  setAgentsState: (machineId: string) => void;

  setIsFetching: (isfetching: boolean) => void;

  setIsReadOnly: (value: boolean) => void;

  setAvailableLicenses: (value: number) => void;

  setCurrentMachines: (machines: AssignMachineDto[]) => void;

  setIsAssigned: (machinesId: string, isAssigned: boolean) => void;

  setAllAssigned: (isAssigned: boolean | "indeterminate") => void;
};

export const useMachinesSelectTableStore = create<State & Actions>((set) => ({
  machineId: null,
  agentsQueryKey: [],
  currentMachines: [],
  isFetching: false,
  allAssigned: false,
  isReadOnly: false,
  availableLicenses: 0,

  setAgentsState: (machineId) =>
    set(() => ({
      machineId: machineId,
      agentsQueryKey: ["machine", machineId],
    })),
  setAvailableLicenses: (value) =>
    set(() => ({
      availableLicenses: value,
    })),

  setIsFetching: (isFetching) =>
    set(() => ({
      isFetching: isFetching,
    })),

  setIsReadOnly: (value) =>
    set(() => ({
      isReadOnly: value,
    })),

  setCurrentMachines: (machines) =>
    set(() => ({
      currentMachines: machines,
    })),

  setIsAssigned: (machinesId: string, isAssigned: boolean) =>
    set((state) => ({
      currentMachines: state.currentMachines.map((m) =>
        m.id === machinesId ? { ...m, isAssigned } : m,
      ),
    })),

  setAllAssigned: (value: boolean | "indeterminate") =>
    set((state) => ({
      allAssigned: value,
      currentMachines: state.currentMachines
        .map((m) => ({
          ...m,
          isAssigned: typeof value === "string" ? m.isAssigned : value,
        }))
        .sort((a, b) =>
          a.isAssigned && !b.isAssigned
            ? -1
            : !a.isAssigned && b.isAssigned
              ? 1
              : a?.name?.localeCompare(b.name),
        ),
    })),
}));
