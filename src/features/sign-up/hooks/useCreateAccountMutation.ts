import { ADD_TENANT, USER_NAME_LS_KEY } from "@/react-toolkit/constants";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { createAccount } from "../apis/create-account-apis";
import { useCreateAccountStore } from "../stores/create-account-store";

export const useCreateAccountMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const {
    createAccountData,
    setStepNo,
    setCreateAccountData,
    setVerifyEmailData,
  } = useCreateAccountStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      createAccountData: state.createAccountData,
      setVerifyEmailData: state.setVerifyEmailData,
      setCreateAccountData: state.setCreateAccountData,
    })),
  );

  // Define mutation to create account
  const { mutate: createAccountMutation, isPending: isCreationPending } =
    useMutation({
      mutationFn: createAccount,
      onSuccess: (httpResponse) => {
        // Set userName in localstorage
        localStorage.setItem(USER_NAME_LS_KEY, createAccountData?.email || "");

        // Reset createAccountData
        setCreateAccountData(null);

        if (httpResponse.message.includes(ADD_TENANT)) {
          navigate("/account-setup");
        }
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
