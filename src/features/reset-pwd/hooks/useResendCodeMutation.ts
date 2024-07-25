import { useResetPwdStore } from "@/features/reset-pwd";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { createVerificationCode } from "@/react-toolkit/apis";
import { toast } from "sonner";
import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums";

export const useResendCodeMutation = () => {
  // Get store state and actions
  const {
    verifyCodeData,
    setStepNo,
    setVerifyCodeData,
  } = useResetPwdStore(
    useShallow((state) => ({
      verifyCodeData: state.verifyCodeData,
      setStepNo: state.setStepNo,
      setVerifyCodeData: state.setVerifyCodeData,
    })),
  );

  // Define mutation
  const { mutate: resendCodeMutation, isPending: isResendCodePending } =
    useMutation({
      mutationFn: createVerificationCode,
      onSuccess: ({ data }) => {
        // Set codeId and details
        setVerifyCodeData({
          email: data.email,
          requestType: data.requestType,
          codeId: data.verificationCodeId,
        });

        // Notify user on success of code creation
        toast.success("Code has been resent to your email");
      },
      onError: () => {
        // Clear codeData state
        setVerifyCodeData(null);

        // Go to Step 1 - Provide email
        setStepNo(1);
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
