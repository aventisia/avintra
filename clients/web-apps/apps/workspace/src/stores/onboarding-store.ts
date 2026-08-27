import { useUserSessionStore } from "@avplatform/ui/stores";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingState {
  /**
   * Whether the Tenant Admin has completed (acknowledged) the "Get Started"
   * onboarding guide. Once true, the first-run redirect no longer fires for
   * this user.
   */
  isComplete: boolean;
  /** Marks the Get Started guide as complete (dismisses future first-run redirects). */
  markComplete: () => void;
  /** Re-reads the persisted onboarding state for the current user (e.g. after login). */
  rehydrateForUser: () => void;
}

/** The current user's email, used to scope onboarding progress per user. */
const getCurrentUserKey = () => useUserSessionStore.getState().userSession?.email ?? "anonymous";

/**
 * Custom storage that scopes the persisted onboarding state per user, mirroring
 * the pattern used by `environment-store.ts`.
 */
const perUserStorage = {
  getItem: () => localStorage.getItem(`onboarding:${getCurrentUserKey()}`),
  setItem: (_name: string, value: string) => {
    localStorage.setItem(`onboarding:${getCurrentUserKey()}`, value);
  },
  removeItem: () => {
    localStorage.removeItem(`onboarding:${getCurrentUserKey()}`);
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isComplete: false,
      markComplete: () => set({ isComplete: true }),
      rehydrateForUser: () => {
        const raw = perUserStorage.getItem();
        if (!raw) {
          set({ isComplete: false });
          return;
        }
        try {
          const parsed = JSON.parse(raw) as { state?: { isComplete?: boolean } };
          set({ isComplete: parsed?.state?.isComplete === true });
        } catch {
          set({ isComplete: false });
        }
      },
    }),
    {
      name: "onboarding",
      storage: createJSONStorage(() => perUserStorage),
    },
  ),
);
