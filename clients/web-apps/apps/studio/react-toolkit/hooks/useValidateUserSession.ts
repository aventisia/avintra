import { refreshSession } from "@avplatform/ui/apis";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

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
