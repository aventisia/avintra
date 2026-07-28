import { create } from "zustand";

type State = {
  /** Version id of the flow */
  versionID: string;

  /** Version number of the flow */
  versionNumber: number | null;
};

type Actions = {
  /** Set Version id*/
  setVersion: (versionID: string, versionNumber: number | null) => void;
};

/**
 * Custom hook for managing the state and actions of the flow version store.
 *
 * @returns An object containing the state and actions of the flows version store.
 */
export const useFlowsVersionsStore = create<State & Actions>((set) => ({
  versionID: "",
  versionNumber: null,

  setVersion: (versionID, versionNumber) =>
    set(() => ({
      versionID,
      versionNumber,
    })),
}));
