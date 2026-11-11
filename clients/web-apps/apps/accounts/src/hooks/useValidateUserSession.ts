import { refreshSession } from "@avplatform/ui/apis/accounts-me-apis";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { hasPlanIntent, resolvePostLoginDestination } from "@/constants/post-login-destination";
import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "@/constants/variables";

/**
 * Custom hook to validate user session and handle session refresh.
 * @returns An object containing the `isPending` state.
 */
export const useValidateUserSession = () => {
  // Get navigate function
  const navigate = useNavigate();

  const { userSession, setUserSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
      setUserSession: state.setUserSession,
    })),
  );

  // Validate user session
  const { mutate, isPending, isIdle, data } = useMutation({
    mutationFn: refreshSession,
    onSuccess: (data) => {
      // Return, If response is null
      if (!data) return;

      // ----------User is authenticated Now----------

      // Set authenticated user locally and session obj in store
      const userSession = setUserSessionLocally(data.data);
      setUserSession(userSession);

      const staysOnOnboarding =
        lacksSubscription(data.message) || (!userSession.hasPaidPlan && hasPlanIntent());
      if (staysOnOnboarding) return;

      navigate("/redirect?msg=Logging In...&url=" + resolvePostLoginDestination(userSession.email));
    },
    onError: () => {
      // Remove user session from store
      setUserSession(null);
    },
  });

  // Refresh the session on app-load.
  useEffect(() => {
    mutate();
  }, [mutate]);

  // return isPending state
  return {
    isPending: isPending || isIdle,
    userSession,
    hasActiveSubscription: !!data && !lacksSubscription(data.message),
  };
};

const lacksSubscription = (message: string) =>
  message.includes(ADD_TENANT) || message.includes(NO_ACTIVE_SUBSCRIPTION);
