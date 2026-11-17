import type { SocialCallbackDto } from "@avplatform/ui/dtos";
import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { buildOnboardingUrl, getPostLoginDestination } from "@/constants/post-login-destination";
import { SOCIAL_SIGN_IN_STATUS } from "@/constants/variables";
import { useLoginStore } from "@/features/login/stores/login-store";
import { getSameOriginRedirectPath } from "@/features/sso-redirect/utils/same-origin-redirect.util";

/**
 * Moves a resolved social sign-in to its next screen: a session redirect, the two-step code
 * screen, the account-link code screen, or the tenant's single sign-on.
 */
const useCompleteSocialSignIn = () => {
  const navigate = useNavigate();

  const { setStepNo, setTwoFACodeData, setSocialChallenge, setSocialLinkData, resetLoginProcess } =
    useLoginStore(
      useShallow((state) => ({
        setStepNo: state.setStepNo,
        setTwoFACodeData: state.setTwoFACodeData,
        setSocialChallenge: state.setSocialChallenge,
        setSocialLinkData: state.setSocialLinkData,
        resetLoginProcess: state.resetLoginProcess,
      })),
    );

  const completeSocialSignIn = (data: SocialCallbackDto) => {
    // The account belongs to a tenant that requires single sign-on
    if (data.status === SOCIAL_SIGN_IN_STATUS.SsoRequired && data.ssoLoginUrl) {
      window.location.assign(data.ssoLoginUrl);
      return;
    }

    // The provider does not own the mailbox, so the account link needs a confirmation code
    if (data.status === SOCIAL_SIGN_IN_STATUS.LinkCodeRequired && data.verificationCodeId) {
      setSocialChallenge(null);
      setSocialLinkData({
        codeId: data.verificationCodeId,
        email: data.email ?? "",
        provider: data.provider ?? "",
      });
      setStepNo(4);
      navigate("/login");
      return;
    }

    // Two-step verification is on for the account
    if (data.status === SOCIAL_SIGN_IN_STATUS.TwoFARequired && data.verificationCodeId) {
      setSocialLinkData(null);
      setTwoFACodeData({
        email: data.email ?? "",
        requestType: VerificationCodeRequestTypesEnum.TwoFA,
        codeId: data.verificationCodeId,
      });
      setSocialChallenge({
        codeId: data.verificationCodeId,
        email: data.email ?? "",
        provider: data.provider ?? "",
        redirectUrl: data.redirectUrl,
        hasPlanIntent: data.hasPlanIntent,
      });
      setStepNo(3);
      navigate("/login");
      return;
    }

    if (data.status === SOCIAL_SIGN_IN_STATUS.SignedIn && data.userSession) {
      const userSession = setUserSessionLocally(data.userSession);
      markFreshLogin();
      resetLoginProcess();

      const redirect = getSameOriginRedirectPath(data.redirectUrl, window.location.origin);

      // A chosen paid plan wins over the page the person came from
      window.location.assign(
        data.hasPlanIntent
          ? buildOnboardingUrl(true)
          : (redirect ?? getPostLoginDestination(userSession.email)),
      );
      return;
    }

    toast.error("Something went wrong. Please try again.");
  };

  return { completeSocialSignIn };
};

export { useCompleteSocialSignIn };
