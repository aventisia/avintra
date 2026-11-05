import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import { useCarryParams } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { resolvePostLoginDestination } from "@/constants/post-login-destination";
import { ADD_TENANT } from "@/constants/variables";

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
      const userSession = setUserSessionLocally(httpResponse.data);

      const hasPlanIntent = new URLSearchParams(window.location.search).has("plan");

      if (httpResponse.message.includes(ADD_TENANT) || hasPlanIntent) {
        navigate(withQueryParams("/onboarding"));
      } else if (userSession.deploymentType == "Enterprise") {
        // Redirect to workspace app
        navigate("/redirect?msg=Logging in...&url=" + import.meta.env.VITE_WORKSPACE_PATH);
      } else {
        navigate(
          "/redirect?msg=Logging in...&url=" + resolvePostLoginDestination(userSession.email),
        );
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
