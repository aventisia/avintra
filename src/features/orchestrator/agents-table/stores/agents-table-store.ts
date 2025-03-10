import { create } from "zustand";

type State = {

  /** machine id for agents */
  machineId: string | null;

  /** Query key for machine */
  agentsQueryKey: string[];
};

type Actions = {
  /** Set agents store state*/
  setAgentsState: (machineId: string) => void;
};

export const useAgentsTableStore = create<State & Actions>((set) => ({
  machineId: null,
  agentsQueryKey: [],

  setAgentsState: (machineId) =>
    set(() => ({
      machineId: machineId,
      agentsQueryKey: ["machine", machineId],
    })),
}));
