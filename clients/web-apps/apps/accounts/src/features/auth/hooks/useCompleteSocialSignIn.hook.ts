import type { SocialCallbackDto } from "@avplatform/ui/dtos";
import { toast } from "@avplatform/ui/sonner";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useNavigate } from "react-router-dom";

import { SOCIAL_SIGN_IN_STATUS } from "@/constants/variables";

import { useAuthStore } from "../stores/auth-store";
import { rememberSignInMethod } from "../utils/last-sign-in-method.util";
import { getSocialSignInDestination } from "../utils/sign-in-destination.util";

/**
 * Moves a resolved social sign-in to its next screen: a session redirect, the two-step or
 * account-link code on `/login`, or the tenant's single sign-on.
 */
const useCompleteSocialSignIn = () => {
  const navigate = useNavigate();
  const startCodeChallenge = useAuthStore((state) => state.startCodeChallenge);
  const reset = useAuthStore((state) => state.reset);

  const completeSocialSignIn = (data: SocialCallbackDto) => {
    if (data.status === SOCIAL_SIGN_IN_STATUS.SsoRequired && data.ssoLoginUrl) {
      window.location.assign(data.ssoLoginUrl);
      return;
    }

    const isCodeRequired =
      data.status === SOCIAL_SIGN_IN_STATUS.LinkCodeRequired ||
      data.status === SOCIAL_SIGN_IN_STATUS.TwoFARequired;

    if (isCodeRequired && data.verificationCodeId) {
      startCodeChallenge({
        purpose:
          data.status === SOCIAL_SIGN_IN_STATUS.LinkCodeRequired ? "social-link" : "social-two-fa",
        email: data.email ?? "",
        codeId: data.verificationCodeId,
        provider: data.provider ?? "",
        redirectUrl: data.redirectUrl,
        hasPlanIntent: data.hasPlanIntent,
      });
      navigate("/login");
      return;
    }

    if (data.status === SOCIAL_SIGN_IN_STATUS.SignedIn && data.userSession) {
      const userSession = setUserSessionLocally(data.userSession);
      reset();
      if (data.provider) rememberSignInMethod(data.provider);
      window.location.assign(getSocialSignInDestination(data, userSession.email));
      return;
    }

    toast.error("Something went wrong. Please try again.");
  };

  return { completeSocialSignIn };
};

export { useCompleteSocialSignIn };
