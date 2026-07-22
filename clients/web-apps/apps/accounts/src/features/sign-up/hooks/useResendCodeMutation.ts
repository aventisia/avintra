import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { createVerificationCode } from "@/react-toolkit/apis/accounts-auth-apis";
import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums/verification-code-request-types-enum";

import { useCreateAccountStore } from "../stores/create-account-store";

export const useResendCodeMutation = () => {
  // Get store state and actions
  const { createAccountData, setStepNo, setVerifyEmailData, setCreateAccountData } =
    useCreateAccountStore(
      useShallow((state) => ({
        createAccountData: state.createAccountData,
        setStepNo: state.setStepNo,
        setVerifyEmailData: state.setVerifyEmailData,
        setCreateAccountData: state.setCreateAccountData,
      })),
    );

  // Define mutation to create verification code
  const { mutate: resendCodeMutation, isPending: isResendCodePending } = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: ({ data }) => {
      // Set codeId and details
      setVerifyEmailData({
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
      setCreateAccountData(null); // Clear create account data
      setVerifyEmailData(null); // Clear verify email  data
      setStepNo(1); // Move previous step
    },
  });

  // Define resend code handler
  const resendCodeHandler = () => {
    // store data is null
    if (!createAccountData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    resendCodeMutation({
      email: createAccountData.email,
      requestType: VerificationCodeRequestTypesEnum.VerifyEmailAddress,
    });
  };

  // Return mutation and pending status
  return { resendCodeHandler, isResendCodePending };
};
