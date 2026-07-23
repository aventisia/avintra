import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { createVerificationCode } from "@/react-toolkit/apis/accounts-auth-apis";

import { useProfileEmailUpdateStore } from "../stores/profile-email-update-store";

export const useCreateCodeMutationForEmailUpdate = () => {
  // Get store state and actions
  const { setStepNo, setVerifyEmailData } = useProfileEmailUpdateStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setVerifyEmailData: state.setVerifyEmailData,
    })),
  );

  // Define mutation to create verification code
  const { mutate: createCodeMutation, isPending: isCodePending } = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: ({ data }) => {
      // Set codeId and details
      setVerifyEmailData({
        email: data.email,
        requestType: data.requestType,
        codeId: data.verificationCodeId,
      });
      toast.success("Verification code has been sent to your email");
      // Go to next step - verify email
      setStepNo(2);
    },
    onError: (error) => {
      toast.error(error.toString());
      setStepNo(1); // Move previous step
    },
  });

  // Return mutation and pending status
  return { createCodeMutation, isCodePending };
};
