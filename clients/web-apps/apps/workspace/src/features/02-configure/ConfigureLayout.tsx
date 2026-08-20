import { useUserSessionStore } from "@avplatform/ui/stores";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useEnvironmentStore } from "@/stores/environment-store";

/**
 * Layout wrapper for the Configure section. Renders the active Configure page
 * below the section header. The Dev/Prod environment toggle lives in the
 * sidebar under the Configure menu.
 */
export const ConfigureLayout = () => {
  // Get the current user session (email) to scope the persisted env per user.
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // When the user session becomes available (e.g. after login), re-read the
  // persisted environment for that user. Defaults to dev if none is stored.
  const { rehydrateForUser } = useEnvironmentStore(
    useShallow((state) => ({
      rehydrateForUser: state.rehydrateForUser,
    })),
  );

  useEffect(() => {
    if (userSession?.email) {
      rehydrateForUser();
    }
  }, [userSession?.email, rehydrateForUser]);

  return (
    <div className="flex flex-col gap-4">
      <Outlet />
    </div>
  );
};
