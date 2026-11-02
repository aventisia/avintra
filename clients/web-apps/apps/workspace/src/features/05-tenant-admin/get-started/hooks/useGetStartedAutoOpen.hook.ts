import { useUserSessionStore } from "@avplatform/ui/stores";
import { consumeFreshLogin, isOnboardingDue } from "@avplatform/ui/utils";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ROLE_TA } from "@/constants/roles";
import { useOnboardingStore } from "@/stores/onboarding-store";

/** Loads the user's guide choices and opens the guide when a tenant admin signs in while it is due. */
export const useGetStartedAutoOpen = () => {
  const userSession = useUserSessionStore((state) => state.userSession);
  const { openGuide, rehydrateForUser } = useOnboardingStore(
    useShallow((state) => ({
      openGuide: state.openGuide,
      rehydrateForUser: state.rehydrateForUser,
    })),
  );

  useEffect(() => {
    if (!userSession) return;

    rehydrateForUser();

    const isFreshLogin = consumeFreshLogin();
    const isTenantAdmin = userSession.userRoles?.includes(ROLE_TA);
    if (isFreshLogin && isTenantAdmin && isOnboardingDue(useOnboardingStore.getState()))
      openGuide();
  }, [openGuide, rehydrateForUser, userSession]);
};
