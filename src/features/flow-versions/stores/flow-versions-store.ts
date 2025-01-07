import { create } from "zustand";

type State = {
  /** Version id of the flow */
  versionID: string;
};

type Actions = {
  /** Set Version id*/
  setVersionID: (versionID: string) => void;
};

/**
 * Custom hook for managing the state and actions of the flow version store.
 *
 * @returns An object containing the state and actions of the flows version store.
 */
export const useFlowsVersionsStore = create<State & Actions>((set) => ({
  versionID: "",

  setVersionID: (versionID) =>
    set(() => ({
      versionID: versionID,
    })),
}));
