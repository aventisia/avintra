import { useResetPwdStore, resetPwd } from "@/features/reset-pwd";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useResetPwdMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { setStepNo, setVerifyCodeData } = useResetPwdStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setVerifyCodeData: state.setVerifyCodeData,
    })),
  );

  // Define mutation
  const { mutate: resetPwdMutation, isPending: isResetPending } = useMutation({
    mutationFn: resetPwd,
    onSuccess: ({ message }) => {
      // Inform user
      toast.success("Success", { description: message });

      //Navigate to login page
      navigate("/login");
    },
    onError: () => {
      // Go to Step 1 - Provide email
      setStepNo(1);
    },
    onSettled: () => {
      // Reset createAccountData
      setVerifyCodeData(null);

      // Set stepNo to 0
      setStepNo(0);
    },
  });

  // Return mutation and pending status
  return { resetPwdMutation, isResetPending };
};
