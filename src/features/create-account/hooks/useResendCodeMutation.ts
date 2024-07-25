import { useCreateAccountStore } from "@/features/create-account";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { createVerificationCode } from "@/react-toolkit/apis";
import { toast } from "sonner";
import { VerificationCodeRequestTypesEnum } from "@/react-toolkit/enums";

export const useResendCodeMutation = () => {
  // Get store state and actions
  const {
    createAccountData,
    setStepNo,
    setVerifyEmailData,
    setCreateAccountData,
  } = useCreateAccountStore(
    useShallow((state) => ({
      createAccountData: state.createAccountData,
      setStepNo: state.setStepNo,
      setVerifyEmailData: state.setVerifyEmailData,
      setCreateAccountData: state.setCreateAccountData,
    })),
  );

  // Define mutation to create verification code
  const { mutate: resendCodeMutation, isPending: isResendCodePending } =
    useMutation({
      mutationFn: createVerificationCode,
      onSuccess: ({ data }) => {
        // Set codeId and details
        setVerifyEmailData({
          email: data.email,
          requestType: data.requestType,
          codeId: data.verificationCodeId,
        });

        // Notify user on success of code creation
        toast.success("Code has been resent to your email");
      },
      onError: () => {
        // Clear create account data
        setCreateAccountData(null);

        // Clear verify email  data
        setVerifyEmailData(null);

        // Move previous step
        setStepNo(1);
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
