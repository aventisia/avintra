import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { createVerificationCode } from "@/react-toolkit/apis/accounts-auth-apis";
import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";

import { useResetPwdStore } from "../stores/reset-pwd-store";

export const useResendCodeMutation = () => {
  // Get store state and actions
  const { verifyCodeData, setStepNo, setVerifyCodeData } = useResetPwdStore(
    useShallow((state) => ({
      verifyCodeData: state.verifyCodeData,
      setStepNo: state.setStepNo,
      setVerifyCodeData: state.setVerifyCodeData,
    })),
  );

  // Define mutation
  const { mutate: resendCodeMutation, isPending: isResendCodePending } = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: ({ data }) => {
      // Set codeId and details
      setVerifyCodeData({
        email: data.email,
        requestType: data.requestType,
        codeId: data.verificationCodeId,
      });

      // Notify user on success of code creation
      toast.success("Code has been resent to your email", {
        className: "sonner-toaster-sm",
      });
    },
    onError: (error) => {
      toast.error(error.toString());
      setVerifyCodeData(null); // Clear verify code data
      setStepNo(1); // Move previous step
    },
  });

  // Define resend code handler
  const resendCodeHandler = () => {
    // store data is null
    if (!verifyCodeData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    resendCodeMutation({
      email: verifyCodeData.email,
      requestType: VerificationCodeRequestTypesEnum.ResetPwd,
    });
  };

  // Return mutation and pending status
  return { resendCodeHandler, isResendCodePending };
};
