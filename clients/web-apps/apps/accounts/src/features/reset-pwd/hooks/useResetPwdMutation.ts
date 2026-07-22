import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { resetPwd } from "../apis/reset-pwd-apis";
import { useResetPwdStore } from "../stores/reset-pwd-store";

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
      toast.success(message, {
        className: "sonner-toaster-sm",
      });

      //Navigate to login page
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.toString());
      setStepNo(1); // Move previous step
    },
    onSettled: () => {
      setVerifyCodeData(null); // Clear verify code data
      setStepNo(1); // Move previous step
    },
  });

  // Return mutation and pending status
  return { resetPwdMutation, isResetPending };
};
