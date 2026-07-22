import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { checkVerificationCode } from "@/react-toolkit/apis/accounts-auth-apis";

import { useResetPwdStore } from "../stores/reset-pwd-store";

export const useVerifyCodeMutation = () => {
  // Get store state and actions
  const { setStepNo, setVerifyCodeData } = useResetPwdStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setVerifyCodeData: state.setVerifyCodeData,
    })),
  );

  // Define mutation
  const { mutate: checkCodeMutation, isPending: isCheckPending } = useMutation({
    mutationFn: checkVerificationCode,
    onSuccess: () => {
      // Reset verifyCodeData
      setVerifyCodeData(null);

      // Go to next step - Reset password
      setStepNo(3);
    },
    onError: (error) => {
      toast.error(error.toString());
      setVerifyCodeData(null); // Clear verify code data
      setStepNo(1); // Move previous step
    },
  });

  // Return mutation and pending status
  return { checkCodeMutation, isCheckPending };
};
