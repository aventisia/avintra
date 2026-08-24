import { refreshSession } from "@avplatform/ui/apis/accounts-me-apis";
import { SESSION_EXPIRED_LS_KEY } from "@avplatform/ui/constants";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "@/constants/variables";
import { getPostLoginDestination } from "@/constants/post-login-destination";

/**
 * Custom hook to validate the user session for the login page.
 * If the user session is valid, it refreshes the session and redirects the user to the appropriate page.
 * If the user session is not valid, it redirects the user to the login page.
 *
 * @returns An object containing the `isPending` state.
 */
export const useValidateUserSessionForLoginPage = () => {
  const navigate = useNavigate();

  // Validate user session
  const { mutate, isPending } = useMutation({
    mutationFn: refreshSession,
    onSuccess: (httpResponse) => {
      // Return, If response is null
      if (!httpResponse) return;

      // Set authenticated user locally
      const userSession = setUserSessionLocally(httpResponse.data);

      // Check if backend message indicates incomplete tenant setup
      if (
        httpResponse.message.includes(ADD_TENANT) ||
        httpResponse.message.includes(NO_ACTIVE_SUBSCRIPTION)
      ) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else {
        //User already onboarded. Redirect url in redirect query or default to Atlas/Workspace
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        const destination = redirect
          ? decodeURIComponent(redirect)
          : getPostLoginDestination(userSession.email);

        navigate("/redirect?msg=Loading...&url=" + destination);
      }
    },
    // onError is not required since axios instance handles 401 error and redirects to login page
  });

  // Refresh the session if exists
  useEffect(() => {
    // Get session expired flag
    const sessionExpired = localStorage.getItem(SESSION_EXPIRED_LS_KEY);

    // If session is not expired, refresh the session
    if (sessionExpired != null && !JSON.parse(sessionExpired)) {
      mutate();
    }
  }, [mutate]);

  // return isPending state
  return { isPending };
};
