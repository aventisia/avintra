import { create } from "zustand";

import { Model } from "../constants/model-providers";

type State = {
  models: Model[];
};

type Actions = {
  /** Set store state*/
  setModels: (models: Model[]) => void;
};

export const useModelProviderStore = create<State & Actions>((set) => ({
  models: [],

  setModels: (models) => set({ models }),
}));
