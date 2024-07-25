import {
  useCreateAccountStore,
  createAccount,
} from "@/features/create-account";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { setUserSessionLocally } from "@/react-toolkit/utils";
import { useNavigate } from "react-router-dom";

export const useCreateAccountMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { setStepNo, setCreateAccountData, setVerifyEmailData } =
    useCreateAccountStore(
      useShallow((state) => ({
        setStepNo: state.setStepNo,
        setVerifyEmailData: state.setVerifyEmailData,
        setCreateAccountData: state.setCreateAccountData,
      })),
    );

  // Define mutation to create account
  const { mutate: createAccountMutation, isPending: isCreationPending } =
    useMutation({
      mutationFn: createAccount,
      onSuccess: (httpResponse) => {
        // Reset createAccountData
        setCreateAccountData(null);

        // Set stepNo to 0
        setStepNo(0);

        // Set authenticated user locally
        const userSessionStoreObj = setUserSessionLocally(httpResponse.data);

        // Route as per user type (internal or external)
        navigate(
          "/redirect?msg=Logging in...&url=" +
            (userSessionStoreObj.isAE
              ? import.meta.env.VITE_INTRANET_CENTER_URL
              : import.meta.env.VITE_WORKSPACE_URL),
        );
      },
      onError: () => {
        // Go to previous step
        setStepNo(1);
      },
      onSettled: () => {
        // Reset verifyEmailData
        setVerifyEmailData(null);
      },
    });

  // Return mutation and pending status
  return { createAccountMutation, isCreationPending };
};
