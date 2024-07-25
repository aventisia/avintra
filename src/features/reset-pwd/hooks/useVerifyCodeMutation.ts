import { useResetPwdStore } from "@/features/reset-pwd";
import { checkVerificationCode } from "@/react-toolkit/apis";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

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
    onError: () => {
      // Reset verifyCodeData
      setVerifyCodeData(null);

      // Go to Step 1 - Provide email
      setStepNo(1);
    },
  });

  // Return mutation and pending status
  return { checkCodeMutation, isCheckPending };
};
