import { useOnboardingStore } from "@/features/on-boarding/stores/on-boarding-store";
import {
  getMySession,
  refreshSession,
} from "@/react-toolkit/apis/accounts-me-apis";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  ADD_TENANT,
  DEV_JWT_LS_KEY,
  NO_ACTIVE_SUBSCRIPTION,
} from "../constants";

/**
 * Custom hook to validate user session and handle session refresh.
 * @returns An object containing the `isPending` state.
 */
export const useValidateUserSession = () => {
  const { onBoardingStep, setOnBoardingStep } = useOnboardingStore(
    useShallow((state) => ({
      onBoardingStep: state.onBoardingStep,
      setOnBoardingStep: state.setOnBoardingStep,
    })),
  );

  const { userSession, setUserSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
      setUserSession: state.setUserSession,
    })),
  );

  // Validate user session
  const { mutate, isPending } = useMutation({
    mutationFn: import.meta.env.DEV ? getMySession : refreshSession,
    onSuccess: (data) => {
      // Return, If response is null
      if (!data) return;

      // ----------User is authenticated Now----------

      // TODO: To be removed
      if (import.meta.env.DEV) {
        localStorage.setItem(DEV_JWT_LS_KEY, data.data.accessToken);
      }

      // Set authenticated user locally and session obj in store
      setUserSession(setUserSessionLocally(data.data));

      // Check if backend message indicates incomplete tenant setup
      if (data.message.includes(ADD_TENANT)) {
        setOnBoardingStep("account-setup");
      } else if (data.message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        setOnBoardingStep("choose-plan");
      }
    },
    onError: () => {
      // Remove user session from store
      setUserSession(null);
    },
  });

  // Refresh the session on app-load.
  useEffect(() => {
    mutate();
  }, []);

  // return isPending state
  return { isPending, userSession, onBoardingStep };
};
