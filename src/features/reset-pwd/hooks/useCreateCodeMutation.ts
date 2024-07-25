import { useResetPwdStore } from "@/features/reset-pwd";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { createVerificationCode } from "@/react-toolkit/apis";

export const useCreateCodeMutation = () => {
  // Get store state and actions
  const { setStepNo, setVerifyCodeData } = useResetPwdStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setVerifyCodeData: state.setVerifyCodeData,
    })),
  );

  // Define mutation
  const { mutate: createCodeMutation, isPending: isCodePending } = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: ({ data }) => {
      // Set codeId and details
      setVerifyCodeData({
        email: data.email,
        requestType: data.requestType,
        codeId: data.verificationCodeId,
      });

      // Go to next step - verify email
      setStepNo(2);
    },
    onError: () => {
      // Reset verifyCodeData
      setVerifyCodeData(null);

      // Go to Step 1 - Provide email
      setStepNo(1);
    },
  });

  // Return mutation and pending status
  return { createCodeMutation, isCodePending };
};
