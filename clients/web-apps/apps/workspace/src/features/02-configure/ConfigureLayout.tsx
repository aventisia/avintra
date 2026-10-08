import { ActionLockProvider } from "@avplatform/ui/action-lock";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ConfigureProdEnvBanner } from "@/features/02-configure/components/ConfigureProdEnvBanner";
import { useEnvironmentStore } from "@/stores/environment-store";

/**
 * Layout wrapper for Configure pages. Renders the active page and, in Prod,
 * shows the environment warning within the content area.
 *
 * The Configure area is wrapped in an `ActionLockProvider` so create/delete
 * actions disable themselves when the Prod environment is selected.
 */
export const ConfigureLayout = () => {
  // Get the current user session (email) to scope the persisted env per user.
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Current environment drives the create/delete lock for this section.
  // When the user session becomes available (e.g. after login), re-read the
  // persisted environment for that user. Defaults to dev if none is stored.
  const { env, rehydrateForUser } = useEnvironmentStore(
    useShallow((state) => ({
      env: state.env,
      rehydrateForUser: state.rehydrateForUser,
    })),
  );

  useEffect(() => {
    if (userSession?.email) {
      rehydrateForUser();
    }
  }, [userSession?.email, rehydrateForUser]);

  const isProd = env === "prod";

  return (
    <ActionLockProvider locked={isProd}>
      <div className="flex flex-col">
        {isProd && <ConfigureProdEnvBanner className="mb-0 mt-5 py-1.5 md:h-10 md:py-0" />}
        <Outlet />
      </div>
    </ActionLockProvider>
  );
};
