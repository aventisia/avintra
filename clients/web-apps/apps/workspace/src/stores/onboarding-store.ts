import { ONBOARDING_LS_KEY_PREFIX } from "@avplatform/ui/constants";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { ONBOARDING_REMINDER_MS, type OnboardingDisposition } from "@avplatform/ui/utils";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type OnboardingSnapshot = {
  disposition: OnboardingDisposition;
  /** Timestamp before which the guide stays quiet after "Remind me later". */
  snoozedUntil: number | null;
  visitedSteps: number[];
};

type OnboardingState = OnboardingSnapshot & {
  isGuideOpen: boolean;
  openGuide: () => void;
  closeGuide: () => void;
  markComplete: () => void;
  dismissForever: () => void;
  /** Hides the guide for the reminder window, replacing any earlier permanent choice. */
  snooze: () => void;
  recordStepVisit: (step: number) => void;
  rehydrateForUser: () => void;
};

const getCurrentUserStorageKey = () =>
  ONBOARDING_LS_KEY_PREFIX + (useUserSessionStore.getState().userSession?.email ?? "anonymous");

/**
 * Custom storage that scopes the persisted onboarding state per user, mirroring
 * the pattern used by `environment-store.ts`.
 */
const perUserStorage = {
  getItem: () => localStorage.getItem(getCurrentUserStorageKey()),
  setItem: (_name: string, value: string) => {
    localStorage.setItem(getCurrentUserStorageKey(), value);
  },
  removeItem: () => {
    localStorage.removeItem(getCurrentUserStorageKey());
  },
};

type PersistedOnboarding = {
  state?: Partial<OnboardingSnapshot> & { isComplete?: boolean };
};

const EMPTY_SNAPSHOT: OnboardingSnapshot = {
  disposition: null,
  snoozedUntil: null,
  visitedSteps: [],
};

const readPersistedSnapshot = (raw: string | null): OnboardingSnapshot => {
  if (!raw) return EMPTY_SNAPSHOT;

  try {
    const state = (JSON.parse(raw) as PersistedOnboarding)?.state;
    const savedDisposition =
      state?.disposition === "completed" || state?.disposition === "dismissed"
        ? state.disposition
        : null;
    /* IMPORTANT NOTE: The first released store saved only `isComplete`; keep honouring it so completed users stay done. */
    const disposition = savedDisposition ?? (state?.isComplete === true ? "completed" : null);

    return {
      disposition,
      snoozedUntil: typeof state?.snoozedUntil === "number" ? state.snoozedUntil : null,
      visitedSteps: Array.isArray(state?.visitedSteps)
        ? state.visitedSteps.filter((step): step is number => typeof step === "number")
        : [],
    };
  } catch {
    return EMPTY_SNAPSHOT;
  }
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...EMPTY_SNAPSHOT,
      isGuideOpen: false,
      openGuide: () =>
        set({ ...readPersistedSnapshot(perUserStorage.getItem()), isGuideOpen: true }),
      closeGuide: () => set({ isGuideOpen: false }),
      markComplete: () => set({ disposition: "completed", snoozedUntil: null }),
      dismissForever: () => set({ disposition: "dismissed", snoozedUntil: null }),
      snooze: () => set({ disposition: null, snoozedUntil: Date.now() + ONBOARDING_REMINDER_MS }),
      recordStepVisit: (step) =>
        set((state) => ({ visitedSteps: [...new Set([...state.visitedSteps, step])] })),
      rehydrateForUser: () => set(readPersistedSnapshot(perUserStorage.getItem())),
    }),
    {
      name: "onboarding",
      storage: createJSONStorage(() => perUserStorage),
      skipHydration: true,
      partialize: ({ disposition, snoozedUntil, visitedSteps }) => ({
        disposition,
        snoozedUntil,
        visitedSteps,
      }),
    },
  ),
);
