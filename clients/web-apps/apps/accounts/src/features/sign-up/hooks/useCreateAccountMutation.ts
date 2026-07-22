import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ADD_TENANT, USER_NAME_LS_KEY } from "@/react-toolkit/constants";
import { useCarryParams } from "@/react-toolkit/hooks/useForwardQueryParams";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { createAccount } from "../apis/create-account-apis";
import { useCreateAccountStore } from "../stores/create-account-store";

export const useCreateAccountMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  const withQueryParams = useCarryParams(["plan", "currency", "frequency"]);

  // Get store state and actions
  const { createAccountData, setStepNo, setCreateAccountData, setVerifyEmailData } =
    useCreateAccountStore(
      useShallow((state) => ({
        setStepNo: state.setStepNo,
        createAccountData: state.createAccountData,
        setVerifyEmailData: state.setVerifyEmailData,
        setCreateAccountData: state.setCreateAccountData,
      })),
    );

  // Define mutation to create account
  const { mutate: createAccountMutation, isPending: isCreationPending } = useMutation({
    mutationFn: createAccount,
    onSuccess: (httpResponse) => {
      // Set userName in localstorage
      localStorage.setItem(USER_NAME_LS_KEY, createAccountData?.email || "");

      // Reset createAccountData
      setCreateAccountData(null);

      // Set authenticated user locally
      const { deploymentType } = setUserSessionLocally(httpResponse.data);

      if (httpResponse.message.includes(ADD_TENANT)) {
        navigate(withQueryParams("/onboarding"));
      } else if (deploymentType == "Enterprise") {
        // Redirect to workspace app
        navigate("/redirect?msg=Logging in...&url=" + import.meta.env.VITE_WORKSPACE_PATH);
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
