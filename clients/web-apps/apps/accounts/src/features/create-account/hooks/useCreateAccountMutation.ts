import { toast } from "@avplatform/ui/sonner";
import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { createAccount } from "../apis/create-account-apis";
import { useCreateAccountStore } from "../stores/create-account-store";

export const useCreateAccountMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { setStepNo, setCreateAccountData, setVerifyEmailData } = useCreateAccountStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setVerifyEmailData: state.setVerifyEmailData,
      setCreateAccountData: state.setCreateAccountData,
    })),
  );

  // Define mutation to create account
  const { mutate: createAccountMutation, isPending: isCreationPending } = useMutation({
    mutationFn: createAccount,
    onSuccess: (httpResponse) => {
      // Reset createAccountData
      setCreateAccountData(null);

      // Set authenticated user locally
      markFreshLogin();
      setUserSessionLocally(httpResponse.data);

      // Redirect to workspace app
      navigate("/redirect?msg=Logging in...&url=" + import.meta.env.VITE_WORKSPACE_PATH);
    },
    onError: (error) => {
      toast.error(error.toString());
      setStepNo(1); // Go to previous step
    },
    onSettled: () => {
      // Reset verifyEmailData
      setVerifyEmailData(null);

      // Set stepNo to 1
      setStepNo(1);
    },
  });

  // Return mutation and pending status
  return { createAccountMutation, isCreationPending };
};
