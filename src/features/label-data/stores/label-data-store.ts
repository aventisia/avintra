import { create } from "zustand";

type State = {
  /** Model id  */
  modelId: string;

  /** Model name  */
  modelName: string;

  /** Query key for label data */
  labelDataQueryKey: string[];

  step: number;

  versionId: string;
};

type Actions = {
  /** Set store state*/
  setModelDataState: (
    modelId: string,
    modelName: string,
    versionId: string,
  ) => void;

  setStepState: (step: number) => void;
};

export const useLabelDataStore = create<State & Actions>((set) => ({
  modelId: "",
  modelName: "",
  labelDataQueryKey: [],
  step: 0,
  versionId: "",
  setModelDataState: (modelId, modelName, versionId) =>
    set(() => ({
      modelId: modelId,
      modelName: modelName,
      labelDataQueryKey: ["dataFields", modelId, versionId],
      versionId,
    })),
  setStepState: (step) =>
    set(() => ({
      step: step,
    })),
}));
