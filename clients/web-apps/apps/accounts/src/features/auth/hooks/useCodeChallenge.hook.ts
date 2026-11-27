import { checkVerificationCode } from "@avplatform/ui/apis/accounts-auth-apis";
import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { useCarryParams } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type * as z from "zod";

import { getDesktopConfirmationPath } from "@/constants/desktop-intent.util";
import {
  buildOnboardingUrl,
  hasPlanIntent,
  resolvePostLoginDestination,
} from "@/constants/post-login-destination";
import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "@/constants/variables";

import { checkTwoFAVerificationCode, createAccount } from "../apis/auth.apis";
import { resendSocialChallenge, verifySocialLink } from "../apis/social-sign-in.apis";
import type { codeFormSchema } from "../constants/auth-zod-schemas";
import { useAuthStore } from "../stores/auth-store";
import { rememberSignInMethod } from "../utils/last-sign-in-method.util";
import {
  buildRedirectPath,
  getPostLoginPath,
  getSocialSignInDestination,
} from "../utils/sign-in-destination.util";
import { useCompleteSocialSignIn } from "./useCompleteSocialSignIn.hook";
import { useSendCodeMutation } from "./useSendCodeMutation.hook";
import { useSignInMutation } from "./useSignInMutation.hook";

type CodeFormValues = z.infer<typeof codeFormSchema>;

const announceNewCode = () => {
  toast.success("We sent a new code to your email.", { className: "sonner-toaster-sm" });
};

/**
 * Submits and resends the code step for whichever challenge is open: sign-up email
 * verification, password reset, two-step verification, or a Google/GitHub account link.
 * A rejected code stays on the step with the reason under the code boxes.
 */
const useCodeChallenge = (form: UseFormReturn<CodeFormValues>) => {
  const navigate = useNavigate();
  const withQueryParams = useCarryParams(["plan", "currency", "frequency"]);
  const showStep = useAuthStore((state) => state.showStep);
  const refreshCodeId = useAuthStore((state) => state.refreshCodeId);
  const reset = useAuthStore((state) => state.reset);

  const { completeSocialSignIn } = useCompleteSocialSignIn();
  const { sendCodeMutation, isSendCodePending } = useSendCodeMutation();
  const { signInMutation, isSignInPending } = useSignInMutation();

  const rejectCode = (error: unknown) => {
    form.reset({ code: "" });
    if (typeof error === "string") form.setError("code", { message: error }, { shouldFocus: true });
  };

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: ({ data, message }, { email }) => {
      localStorage.setItem(USER_NAME_LS_KEY, email);
      rememberSignInMethod("email");
      reset();
      markFreshLogin();
      const userSession = setUserSessionLocally(data);

      if (message.includes(ADD_TENANT) || hasPlanIntent()) {
        navigate(withQueryParams("/onboarding"));
        return;
      }

      navigate(
        getDesktopConfirmationPath() ??
          buildRedirectPath(
            userSession.deploymentType == "Enterprise"
              ? import.meta.env.VITE_WORKSPACE_PATH
              : resolvePostLoginDestination(userSession.email),
          ),
      );
    },
    onError: rejectCode,
  });

  const verifyResetCodeMutation = useMutation({
    mutationFn: checkVerificationCode,
    onSuccess: () => showStep("new-password"),
    onError: rejectCode,
  });

  const checkTwoFACodeMutation = useMutation({
    mutationFn: checkTwoFAVerificationCode,
    onSuccess: ({ data, message }) => {
      const { codeChallenge } = useAuthStore.getState();

      if (codeChallenge?.purpose === "social-two-fa") {
        rememberSignInMethod(codeChallenge.provider);

        if (message.includes(ADD_TENANT) || message.includes(NO_ACTIVE_SUBSCRIPTION)) {
          window.location.assign(buildOnboardingUrl(codeChallenge.hasPlanIntent));
          return;
        }

        markFreshLogin();
        const userSession = setUserSessionLocally(data);
        window.location.assign(getSocialSignInDestination(codeChallenge, userSession.email));
        return;
      }

      markFreshLogin();
      const userSession = setUserSessionLocally(data);

      rememberSignInMethod("email");
      reset();
      navigate(getPostLoginPath(userSession.email));
    },
    onError: rejectCode,
  });

  const verifySocialLinkMutation = useMutation({
    mutationFn: verifySocialLink,
    onSuccess: ({ data, message }) => completeSocialSignIn(data, message),
    onError: rejectCode,
  });

  const resendSocialChallengeMutation = useMutation({
    mutationFn: resendSocialChallenge,
    onSuccess: ({ data }) => {
      if (!data?.verificationCodeId) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      refreshCodeId(data.verificationCodeId);
      announceNewCode();
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  const submitCode = ({ code }: CodeFormValues) => {
    const { codeChallenge, pwd } = useAuthStore.getState();
    if (!codeChallenge) return;

    const { email, codeId: verificationCodeId } = codeChallenge;

    switch (codeChallenge.purpose) {
      case "verify-email":
        createAccountMutation.mutate({
          email,
          pwd,
          verificationCodeId,
          secretCode: code,
          isSocialSignUp: false,
        });
        return;
      case "reset-pwd":
        verifyResetCodeMutation.mutate({
          email,
          verificationCodeId,
          requestType: codeChallenge.requestType,
          secretCode: code,
        });
        return;
      case "two-fa":
      case "social-two-fa":
        checkTwoFACodeMutation.mutate({
          email,
          verificationCodeId,
          requestType: VerificationCodeRequestTypesEnum.TwoFA,
          secretCode: code,
        });
        return;
      case "social-link":
        verifySocialLinkMutation.mutate({ verificationCodeId, secretCode: code });
    }
  };

  const resendCode = () => {
    const { codeChallenge, pwd } = useAuthStore.getState();
    if (!codeChallenge) return;

    form.reset({ code: "" });

    switch (codeChallenge.purpose) {
      case "verify-email":
      case "reset-pwd":
        sendCodeMutation(
          { email: codeChallenge.email, purpose: codeChallenge.purpose },
          { onSuccess: announceNewCode },
        );
        return;
      case "two-fa":
        signInMutation({ email: codeChallenge.email, pwd }, { onSuccess: announceNewCode });
        return;
      case "social-link":
      case "social-two-fa":
        resendSocialChallengeMutation.mutate({
          verificationCodeId: codeChallenge.codeId,
          email: codeChallenge.email,
          provider: codeChallenge.provider,
        });
    }
  };

  const isSubmitPending =
    createAccountMutation.isPending ||
    verifyResetCodeMutation.isPending ||
    checkTwoFACodeMutation.isPending ||
    verifySocialLinkMutation.isPending;

  const isResendPending =
    isSendCodePending || isSignInPending || resendSocialChallengeMutation.isPending;

  return { submitCode, resendCode, isSubmitPending, isResendPending };
};

export { useCodeChallenge };
