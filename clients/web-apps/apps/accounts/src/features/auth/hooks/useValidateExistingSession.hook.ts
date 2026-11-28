import { refreshSession } from "@avplatform/ui/apis/accounts-me-apis";
import { SESSION_EXPIRED_LS_KEY } from "@avplatform/ui/constants";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getDesktopConfirmationPath } from "@/constants/desktop-intent.util";
import {
  buildOnboardingUrl,
  resolvePostLoginDestination,
} from "@/constants/post-login-destination";
import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "@/constants/variables";

import { buildRedirectPath } from "../utils/sign-in-destination.util";

/**
 * Sends a person who still has a live session past the sign-in screen: to onboarding when the
 * tenant setup is unfinished, otherwise to the same-origin `redirect` param or the default app.
 */
const useValidateExistingSession = ({ enabled }: { enabled: boolean }) => {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: refreshSession,
    onSuccess: (httpResponse) => {
      if (!httpResponse) return;

      const userSession = setUserSessionLocally(httpResponse.data);

      if (
        httpResponse.message.includes(ADD_TENANT) ||
        httpResponse.message.includes(NO_ACTIVE_SUBSCRIPTION)
      ) {
        window.location.href = buildOnboardingUrl();
        return;
      }

      navigate(
        getDesktopConfirmationPath() ??
          buildRedirectPath(resolvePostLoginDestination(userSession.email), "Loading..."),
      );
    },
  });

  useEffect(() => {
    if (!enabled) return;

    const sessionExpired = localStorage.getItem(SESSION_EXPIRED_LS_KEY);
    if (sessionExpired != null && !JSON.parse(sessionExpired)) mutate();
  }, [enabled, mutate]);

  return { isPending };
};

export { useValidateExistingSession };
