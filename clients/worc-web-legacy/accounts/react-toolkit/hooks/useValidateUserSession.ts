import { useOnboardingStore } from "@/features/on-boarding/stores/on-boarding-store";
import { refreshSession } from "@/react-toolkit/apis/accounts-me-apis";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "../constants";

/**
 * Custom hook to validate user session and handle session refresh.
 * @returns An object containing the `isPending` state.
 */
export const useValidateUserSession = () => {
  // Get navigate function
  const navigate = useNavigate();

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
    mutationFn: refreshSession,
    onSuccess: (data) => {
      // Return, If response is null
      if (!data) return;

      // ----------User is authenticated Now----------

      // Set authenticated user locally and session obj in store
      setUserSession(setUserSessionLocally(data.data));

      // Check if backend message indicates incomplete tenant setup
      if (data.message.includes(ADD_TENANT)) {
        setOnBoardingStep("account-setup");
      } else if (data.message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        setOnBoardingStep("choose-plan");
      } else {
        //User already onboarded. Redirect url in redirect query or default to wroc
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        const destination = redirect
          ? decodeURIComponent(redirect)
          : import.meta.env.VITE_WORC_PATH;

        navigate("/redirect?msg=Logging In...&url=" + destination);
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
  }, [mutate]);

  // return isPending state
  return { isPending, userSession, onBoardingStep };
};
