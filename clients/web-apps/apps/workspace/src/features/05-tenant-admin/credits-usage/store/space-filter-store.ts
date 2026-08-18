import { create } from "zustand";

/**
 * Space filter state for the Usage page.
 *
 * - `allSpaceIds`: all selectable space option IDs, including the Central space.
 * - `selectedSpaceIds`: the currently selected space option IDs (a subset of
 *   `allSpaceIds`). Defaults to all spaces selected (initialized by the
 *   `SpaceFilterSelect` component once the space options load).
 * - `centralSpaceId`: the option ID representing the Central space (SpaceId == null
 *   in the backend), if present. Used to derive the API filter params.
 * - A minimum of one space must remain selected (enforced in the selector).
 */
interface SpaceFilterState {
  allSpaceIds: string[];
  selectedSpaceIds: string[];
  centralSpaceId: string | null;
  setAllSpaceIds: (ids: string[]) => void;
  setCentralSpaceId: (id: string | null) => void;
  setSelectedSpaceIds: (ids: string[]) => void;
  reset: () => void;
}

export const useSpaceFilterStore = create<SpaceFilterState>((set) => ({
  allSpaceIds: [],
  selectedSpaceIds: [],
  centralSpaceId: null,
  setAllSpaceIds: (ids) => set({ allSpaceIds: ids }),
  setCentralSpaceId: (id) => set({ centralSpaceId: id }),
  setSelectedSpaceIds: (ids) => set({ selectedSpaceIds: ids }),
  reset: () =>
    set((state) => ({
      selectedSpaceIds: state.allSpaceIds,
    })),
}));
