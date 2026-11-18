import { createVerificationCode } from "@avplatform/ui/apis/accounts-auth-apis";
import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "../stores/auth-store";

type SendCodeVariables = { email: string; purpose: "verify-email" | "reset-pwd" };

const REQUEST_TYPES: Record<SendCodeVariables["purpose"], string> = {
  "verify-email": VerificationCodeRequestTypesEnum.VerifyEmailAddress,
  "reset-pwd": VerificationCodeRequestTypesEnum.ResetPwd,
};

/** Emails a sign-up or password-reset code and opens the code step for it. */
const useSendCodeMutation = () => {
  const startCodeChallenge = useAuthStore((state) => state.startCodeChallenge);

  const { mutate: sendCodeMutation, isPending: isSendCodePending } = useMutation({
    mutationFn: ({ email, purpose }: SendCodeVariables) =>
      createVerificationCode({ email, requestType: REQUEST_TYPES[purpose] }),
    onSuccess: ({ data }, { purpose }) => {
      startCodeChallenge({
        purpose,
        email: data.email,
        codeId: data.verificationCodeId,
        requestType: data.requestType,
      });
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  return { sendCodeMutation, isSendCodePending };
};

export { useSendCodeMutation };
