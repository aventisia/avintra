import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { sortAsAssignedFirst } from "../../machines-table/constants";
import { QueueAgentsDto } from "../dtos/queue-agents-dto";

type State = {
  /** agent id for agents */
  agentId: string | null;

  /** Query key for agent */
  agentsQueryKey: string[];

  allAssigned: boolean | "indeterminate";

  isReadOnly: boolean;

  currentAgents: QueueAgentsDto[];
};

type Actions = {
  /** Set agents store state*/
  setAgentsState: (agentId: string) => void;

  setIsReadOnly: (value: boolean) => void;

  setCurrentAgents: (agents: QueueAgentsDto[]) => void;

  setIsAssigned: (agentsId: string, isAssigned: boolean) => void;

  setAllAssigned: (isAssigned: boolean | "indeterminate") => void;
};

export const useAssignAgentsStore = create<State & Actions>()(
  subscribeWithSelector((set) => ({
    agentId: null,
    agentsQueryKey: [],
    currentAgents: [],
    allAssigned: false,
    isReadOnly: false,

    setAgentsState: (agentId) =>
      set(() => ({
        agentId: agentId,
        agentsQueryKey: ["agent", agentId],
      })),

    setIsReadOnly: (value) =>
      set(() => ({
        isReadOnly: value,
      })),

    setCurrentAgents: (agents) =>
      set(() => ({
        currentAgents: agents,
      })),

    setIsAssigned: (agentsId: string, isAssigned: boolean) =>
      set((state) => {
        return {
          currentAgents: state.currentAgents.map((m) =>
            m.id === agentsId ? { ...m, isAssigned } : m,
          ),
        };
      }),

    setAllAssigned: (value: boolean | "indeterminate") =>
      set((state) => {
        return {
          allAssigned: value,
          currentAgents: state.currentAgents
            .map((m) => ({
              ...m,
              isAssigned: typeof value === "string" ? m.isAssigned : value,
            }))
            .sort(sortAsAssignedFirst),
        };
      }),
  })),
);
