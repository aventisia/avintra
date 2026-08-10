import { useUserSessionStore } from "@avplatform/ui/stores";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Sentinel value used by the Space dropdown to represent the "Central" space.
 * Central is stored as `null` in the store (no X-Space-Id header is sent), so
 * this sentinel is only used as the Select value to render the "Central" label.
 */
export const CENTRAL_SPACE_VALUE = "central";

export interface CurrentSpace {
  id: string;
  name: string;
}

interface CurrentSpaceState {
  currentSpace: CurrentSpace | null;
  setCurrentSpace: (space: CurrentSpace | null) => void;
  /** Re-reads the persisted space for the current user (e.g. after login). */
  rehydrateForUser: () => void;
}

/**
 * The current user's email, used to scope the persisted space per user so that
 * each user's last-selected space is remembered independently. Falls back to
 * "anonymous" when no session is present (e.g. before login / after logout).
 */
const getCurrentUserKey = () =>
  useUserSessionStore.getState().userSession?.email ?? "anonymous";

/**
 * Custom storage that scopes the persisted space per user. The persist
 * middleware handles JSON serialization; this storage only maps the logical
 * key to a per-user localStorage key.
 */
const perUserStorage = {
  getItem: () => localStorage.getItem(`current-space:${getCurrentUserKey()}`),
  setItem: (_name: string, value: string) => {
    localStorage.setItem(`current-space:${getCurrentUserKey()}`, value);
  },
  removeItem: () => {
    localStorage.removeItem(`current-space:${getCurrentUserKey()}`);
  },
};

export const useCurrentSpaceStore = create<CurrentSpaceState>()(
  persist(
    (set) => ({
      // null = Central (the default). Never blank.
      currentSpace: null,
      setCurrentSpace: (space) => set({ currentSpace: space }),
      rehydrateForUser: () => {
        const raw = perUserStorage.getItem();
        if (!raw) {
          // No persisted space for this user yet -> default to Central.
          set({ currentSpace: null });
          return;
        }
        try {
          const parsed = JSON.parse(raw) as { state?: { currentSpace?: CurrentSpace | null } };
          set({ currentSpace: parsed?.state?.currentSpace ?? null });
        } catch {
          set({ currentSpace: null });
        }
      },
    }),
    {
      name: "current-space",
      storage: createJSONStorage(() => perUserStorage),
    },
  ),
);
