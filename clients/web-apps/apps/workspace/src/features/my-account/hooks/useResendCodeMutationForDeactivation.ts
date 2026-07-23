import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { createVerificationCode } from "@/react-toolkit/apis/accounts-auth-apis";

import { useProfileEmailUpdateStore } from "../stores/profile-email-update-store";

export const useResendCodeMutationForDeactivation = () => {
  // Get store state and actions
  const { updateProfileEmailData, setStepNo, setVerifyEmailData, setUpdateProfileEmailData } =
    useProfileEmailUpdateStore(
      useShallow((state) => ({
        updateProfileEmailData: state.updateProfileEmailData,
        setStepNo: state.setStepNo,
        setVerifyEmailData: state.setVerifyEmailData,
        setUpdateProfileEmailData: state.setUpdateProfileEmailData,
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
      setUpdateProfileEmailData(null); // Clear update email data
      setVerifyEmailData(null); // Clear verify email  data
      setStepNo(1); // Move previous step
    },
  });

  // Define resend code handler
  const resendCodeHandler = () => {
    // store data is null
    if (!updateProfileEmailData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    resendCodeMutation({
      email: updateProfileEmailData.email,
      requestType: VerificationCodeRequestTypesEnum.VerifyEmailAddress,
    });
  };

  // Return mutation and pending status
  return { resendCodeHandler, isResendCodePending };
};
