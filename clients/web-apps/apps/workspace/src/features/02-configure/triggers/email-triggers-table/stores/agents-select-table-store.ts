import { create } from "zustand";

import { sortAsAssignedFirst } from "@/features/03-orchestrator/machines-table/constants";

import type { SelectAgentTableDto } from "../dtos/select-agent-table-dto";

type State = {
  /** agent id for agents */
  agentId: string | null;

  /** Query key for agent */
  agentsQueryKey: string[];

  allAssigned: boolean | "indeterminate";

  availableLicenses: number;

  isReadOnly: boolean;

  currentAgents: SelectAgentTableDto[];
};

type Actions = {
  /** Set agents store state*/
  setAgentsState: (agentId: string) => void;

  setIsReadOnly: (value: boolean) => void;

  setAvailableLicenses: (value: number) => void;

  setCurrentAgents: (agents: SelectAgentTableDto[]) => void;

  setIsAssigned: (agentsId: string, isAssigned: boolean) => void;

  setAllAssigned: (isAssigned: boolean | "indeterminate") => void;
};

export const useAgentsSelectTableStore = create<State & Actions>((set) => ({
  agentId: null,
  agentsQueryKey: [],
  currentAgents: [],
  allAssigned: false,
  availableLicenses: 0,
  isReadOnly: false,

  setAgentsState: (agentId) =>
    set(() => ({
      agentId: agentId,
      agentsQueryKey: ["agent", agentId],
    })),

  setAvailableLicenses: (value) =>
    set(() => ({
      availableLicenses: value,
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
}));
