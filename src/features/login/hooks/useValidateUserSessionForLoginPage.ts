import { refreshSession } from "@/react-toolkit/apis/accounts-me-apis";
import { SESSION_EXPIRED_LS_KEY } from "@/react-toolkit/constants";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      const userSessionStoreObj = setUserSessionLocally(httpResponse.data);

      // TODO: Route as per user type (internal or external)
      navigate(
        "/redirect?msg=Loading...&url=" +
          (userSessionStoreObj.isAE
            ? import.meta.env.VITE_WORKSPACE_URL
            : import.meta.env.VITE_WORKSPACE_URL),
      );
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
