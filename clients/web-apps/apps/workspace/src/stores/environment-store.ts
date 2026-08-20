import { useUserSessionStore } from "@avplatform/ui/stores";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** The supported deployment environments for the Configure section. */
export type ConfigureEnvironment = "dev" | "prod";

/** Sentinel header value sent to the backend as `X-Env-Type`. */
export const DEFAULT_ENVIRONMENT: ConfigureEnvironment = "dev";

interface EnvironmentState {
  env: ConfigureEnvironment;
  setEnv: (env: ConfigureEnvironment) => void;
  /** Re-reads the persisted environment for the current user (e.g. after login). */
  rehydrateForUser: () => void;
}

/**
 * The current user's email, used to scope the persisted environment per user so
 * that each user's last-selected environment is remembered independently. Falls
 * back to "anonymous" when no session is present.
 */
const getCurrentUserKey = () => useUserSessionStore.getState().userSession?.email ?? "anonymous";

/**
 * Custom storage that scopes the persisted environment per user. The persist
 * middleware handles JSON serialization; this storage only maps the logical
 * key to a per-user localStorage key.
 */
const perUserStorage = {
  getItem: () => localStorage.getItem(`configure-env:${getCurrentUserKey()}`),
  setItem: (_name: string, value: string) => {
    localStorage.setItem(`configure-env:${getCurrentUserKey()}`, value);
  },
  removeItem: () => {
    localStorage.removeItem(`configure-env:${getCurrentUserKey()}`);
  },
};

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set) => ({
      // Default to dev, matching the backend default when the header is absent.
      env: DEFAULT_ENVIRONMENT,
      setEnv: (env) => set({ env }),
      rehydrateForUser: () => {
        const raw = perUserStorage.getItem();
        if (!raw) {
          // No persisted environment for this user yet -> default to dev.
          set({ env: DEFAULT_ENVIRONMENT });
          return;
        }
        try {
          const parsed = JSON.parse(raw) as { state?: { env?: ConfigureEnvironment } };
          const persisted = parsed?.state?.env;
          set({ env: persisted === "prod" ? "prod" : DEFAULT_ENVIRONMENT });
        } catch {
          set({ env: DEFAULT_ENVIRONMENT });
        }
      },
    }),
    {
      name: "configure-env",
      storage: createJSONStorage(() => perUserStorage),
    },
  ),
);
