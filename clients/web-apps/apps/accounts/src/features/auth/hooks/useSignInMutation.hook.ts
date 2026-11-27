import { toast } from "@avplatform/ui/sonner";
import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { buildOnboardingUrl } from "@/constants/post-login-destination";
import {
  ADD_TENANT,
  NO_ACTIVE_SUBSCRIPTION,
  PWD_EXPIRED,
  SSO_DISABLED,
  TWO_FA_ENABLED,
} from "@/constants/variables";

import { authenticateUser } from "../apis/auth.apis";
import { useAuthStore } from "../stores/auth-store";
import { rememberSignInMethod } from "../utils/last-sign-in-method.util";
import { getPostLoginPath } from "../utils/sign-in-destination.util";

type UseSignInMutationOptions = {
  /** Shows a rejected sign-in, such as a wrong password; a toast when omitted */
  onRejected?: (message: string) => void;
};

/** Signs in with email and password, moving to the 2FA code when the account asks for it. */
const useSignInMutation = ({ onRejected }: UseSignInMutationOptions = {}) => {
  const navigate = useNavigate();
  const setPwd = useAuthStore((state) => state.setPwd);
  const startCodeChallenge = useAuthStore((state) => state.startCodeChallenge);
  const reset = useAuthStore((state) => state.reset);

  const { mutate: signInMutation, isPending: isSignInPending } = useMutation({
    mutationFn: authenticateUser,
    onSuccess: ({ data, message }, variables) => {
      if (message.includes(PWD_EXPIRED)) {
        toast.warning("Password expired", {
          description: "Use Forgot password to choose a new one.",
        });
        return;
      }

      if (message.includes(TWO_FA_ENABLED)) {
        setPwd(variables.pwd);
        startCodeChallenge({
          purpose: "two-fa",
          email: data.email,
          codeId: data.verificationCodeId,
          requestType: data.requestType,
        });
        return;
      }

      rememberSignInMethod("email");

      if (message.includes(ADD_TENANT) || message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        window.location.href = buildOnboardingUrl();
        return;
      }

      reset();
      markFreshLogin();
      const userSession = setUserSessionLocally(data);
      navigate(getPostLoginPath(userSession.email));
    },
    onError: (error: unknown) => {
      const message = String(error);

      if (message.includes(SSO_DISABLED)) {
        toast.warning("Single sign-on disabled", {
          description: `${message}. Set a password with Forgot password to sign in.`,
        });
        return;
      }

      if (onRejected) onRejected(message);
      else toast.error(message);
    },
  });

  return { signInMutation, isSignInPending };
};

export { useSignInMutation };
