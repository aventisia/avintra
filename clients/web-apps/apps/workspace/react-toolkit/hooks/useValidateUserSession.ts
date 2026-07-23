import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "@avplatform/ui/constants";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { refreshSession } from "@/react-toolkit/apis/accounts-me-apis";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

/**
 * Custom hook to validate user session and handle session refresh.
 * @returns An object containing the `isPending` state.
 */
export const useValidateUserSession = () => {
  const { userSession, setUserSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
      setUserSession: state.setUserSession,
    })),
  );

  // Validate user session
  const { mutate, isPending } = useMutation({
    mutationFn: refreshSession,
    onSuccess: (httpResponse) => {
      // Return, If response is null
      if (!httpResponse) return;

      // Check if backend message indicates incomplete tenant setup or subscription
      if (
        httpResponse.message.includes(ADD_TENANT) ||
        httpResponse.message.includes(NO_ACTIVE_SUBSCRIPTION)
      ) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      }

      // Set authenticated user locally and session obj in store
      setUserSession(setUserSessionLocally(httpResponse.data));
    },
    onError: () => {
      // Remove user session from store
      setUserSession(null);

      // Toaster and redirection are not required since axios instance handles 401 error and redirects to login page
    },
  });

  // Refresh the session on app-load.
  useEffect(() => {
    mutate();
  }, [mutate]);

  // return isPending state
  return { isPending, userSession };
};
