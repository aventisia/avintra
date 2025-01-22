import {
  getMySession,
  refreshSession,
} from "@/react-toolkit/apis/accounts-me-apis";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { redirectToLoginUtil } from "@/react-toolkit/utils/redirect-utils";
import {
  isUserSessionValid,
  removeUserSessionLocally,
  setUserSessionLocally,
} from "@/react-toolkit/utils/user-session-utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Custom hook to validate user session and handle session refresh.
 * @returns An object containing the `isPending` state.
 */
export const useValidateUserSession = () => {
  const { setUserSession } = useUserSessionStore();

  // Validate user session
  const { mutate, isPending } = useMutation({
    mutationFn: import.meta.env.DEV ? getMySession : refreshSession,
    onSuccess: (httpResponse) => {
      // Return, If response is null
      if (!httpResponse) return;

      // Set authenticated user locally and session obj in store
      setUserSession(setUserSessionLocally(httpResponse.data));
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.toString());

      // Remove user session from store
      setUserSession(null);

      // Remove user session from local storage and redirect to login page
      removeUserSessionLocally(true);
    },
  });

  // Refresh the session on app-load.
  useEffect(() => {
    if (import.meta.env.DEV) {
      mutate();
    } else {
      if (isUserSessionValid()) mutate();
      else redirectToLoginUtil();
    }
  }, [mutate]);

  // return isPending state
  return { isPending };
};
