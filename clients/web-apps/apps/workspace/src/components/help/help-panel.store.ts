import { create } from "zustand";

type State = {
  /** Whether the help panel is open */
  isOpen: boolean;
  /** Guide shown in the panel; null follows the current page */
  guideId: string | null;
  /** Whether the panel lists all guides instead of showing one */
  isIndexOpen: boolean;
};

type Actions = {
  /** Opens the panel on a guide, or on the current page's guide when omitted */
  openGuide: (guideId?: string) => void;
  /** Shows or hides the list of all guides */
  toggleIndex: (value?: boolean) => void;
  /** Opens or closes the panel */
  toggleOpen: (value?: boolean) => void;
  /** Makes the panel follow the current page again */
  followPage: () => void;
};

export const useHelpPanelStore = create<State & Actions>((set) => ({
  isOpen: false,
  guideId: null,
  isIndexOpen: false,

  openGuide: (guideId) => set({ isOpen: true, guideId: guideId ?? null, isIndexOpen: false }),

  toggleIndex: (value) =>
    set((state) => ({ isIndexOpen: typeof value === "boolean" ? value : !state.isIndexOpen })),

  toggleOpen: (value) =>
    set((state) => ({ isOpen: typeof value === "boolean" ? value : !state.isOpen })),

  followPage: () => set({ guideId: null, isIndexOpen: false }),
}));
