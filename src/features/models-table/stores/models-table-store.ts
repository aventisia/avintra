import { create } from "zustand";

type State = {
  /** Project id for models */
  projectId: string;

  /** Project name for models */
  projectName: string;

  /** Query key for models */
  modelsQueryKey: string[];
};

type Actions = {
  /** Set models store state*/
  setModelsState: (projectId: string, projectName: string) => void;
};

export const useModelsTableStore = create<State & Actions>((set) => ({
  projectId: "",
  projectName: "",
  modelsQueryKey: [],

  setModelsState: (projectId, projectName) =>
    set(() => ({
      projectId: projectId,
      projectName: projectName,
      modelsQueryKey: ["models", projectId],
    })),
}));
