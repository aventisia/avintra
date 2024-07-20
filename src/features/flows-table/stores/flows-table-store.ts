import { create } from "zustand";

type State = {
  /** Project id for flows */
  projectId: string;

  /** Project name for flows */
  projectName: string;

  /** Query key for flows */
  flowsQueryKey: string[];
};

type Actions = {
  /** Set flows store state*/
  setFlowsState: (projectId: string, projectName: string) => void;
};

export const useFlowsTableStore = create<State & Actions>((set) => ({
  projectId: "",
  projectName: "",
  flowsQueryKey: [],

  setFlowsState: (projectId, projectName) =>
    set(() => ({
      projectId: projectId,
      projectName: projectName,
      flowsQueryKey: ["flows", projectId],
    })),
}));
