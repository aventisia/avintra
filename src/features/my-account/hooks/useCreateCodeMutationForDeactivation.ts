import { createVerificationCode } from "@/react-toolkit/apis/accounts-auth-apis";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { useAccountDeactivationStore } from "../stores/account-deactivation-store";

export const useCreateCodeMutationForDeactivation = () => {
  // Get store state and actions
  const { setStepNo, setVerifyEmailData } = useAccountDeactivationStore(
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
