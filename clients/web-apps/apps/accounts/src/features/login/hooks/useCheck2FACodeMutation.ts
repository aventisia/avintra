import { toast } from "@avplatform/ui/sonner";
import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { buildOnboardingUrl, getPostLoginDestination } from "@/constants/post-login-destination";
import { getSameOriginRedirectPath } from "@/features/sso-redirect/utils/same-origin-redirect.util";

import { checkTwoFAVerificationCode } from "../apis/login-apis";
import { useLoginStore } from "../stores/login-store";

export const useCheck2FACodeMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { resetLoginProcess, socialChallenge } = useLoginStore(
    useShallow((state) => ({
      resetLoginProcess: state.resetLoginProcess,
      socialChallenge: state.socialChallenge,
    })),
  );

  // Define mutation
  const { mutate: check2FACodeMutation, isPending: isCheckPending } = useMutation({
    mutationFn: checkTwoFAVerificationCode,
    onSuccess: ({ data }) => {
      // A social attempt keeps the page it came from and the paid plan that was chosen
      const socialRedirect = socialChallenge
        ? getSameOriginRedirectPath(socialChallenge.redirectUrl, window.location.origin)
        : null;
      const hasPlanIntent = socialChallenge?.hasPlanIntent ?? false;

      // Reset login process
      resetLoginProcess();

      // Set authenticated user locally
      markFreshLogin();
      const userSession = setUserSessionLocally(data);

      if (socialChallenge) {
        window.location.assign(
          hasPlanIntent
            ? buildOnboardingUrl(true)
            : (socialRedirect ?? getPostLoginDestination(userSession.email)),
        );
        return;
      }

      // Redirect to Atlas (Aventisia employees) or Workspace app
      navigate("/redirect?msg=Logging in...&url=" + getPostLoginDestination(userSession.email));
    },
    onError: (error) => {
      toast.error(error.toString());
      resetLoginProcess();
    },
  });

  // Return mutation and pending status
  return { check2FACodeMutation, isCheckPending };
};
