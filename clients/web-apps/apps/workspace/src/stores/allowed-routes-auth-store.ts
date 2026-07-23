import { create } from "zustand";

type State = {
  allowedRoutes: string[];
};

type Actions = {
  setAllowedRoutes: (allowedRoutes: string[]) => void;
};

export const useAllowedRoutesStore = create<State & Actions>((set) => ({
  allowedRoutes: [],

  setAllowedRoutes: (allowedRoutes) => set({ allowedRoutes }),
}));
