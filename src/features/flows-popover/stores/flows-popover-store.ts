import { create } from "zustand";

type State = {
  /** Project id for flows */
  projectId: string;

  /** Query key for flows */
  flowsQueryKey: string[];

  /** Count of flows associated with one project */
  flowsCount: number;

  /** To manage popover open/close state */
  isPopoverOpen: boolean;
};

type Actions = {
  /** Set Query key*/
  setFlowsQueryKey: (projectId: string) => void;

  /** Set the count of flows */
  setFlowsCount: (count: number) => void;

  /** To toggle popover open/close state */
  togglePopoverOpen: (value?: boolean) => void;
};

/**
 * Custom hook for managing the state and actions of the flows popover store.
 *
 * @returns An object containing the state and actions of the flows popover store.
 */
export const useFlowsPopoverStore = create<State & Actions>((set) => ({
  projectId: "",
  flowsQueryKey: [],
  flowsCount: 0,
  isPopoverOpen: false,

  setFlowsQueryKey: (projectId) =>
    set(() => ({
      projectId: projectId,
      flowsQueryKey: ["flows", projectId],
    })),

  setFlowsCount: (count) => set({ flowsCount: count }),

  togglePopoverOpen: (value) =>
    set((state) => ({
      isPopoverOpen: typeof value === "boolean" ? value : !state.isPopoverOpen,
    })),
}));
