import { toast } from "@avplatform/ui/sonner";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import {
  ADD_TENANT,
  NO_ACTIVE_SUBSCRIPTION,
  PWD_EXPIRED,
  TWO_FA_ENABLED,
} from "@/constants/variables";
import { getPostLoginDestination } from "@/constants/post-login-destination";

import { authenticateUser } from "../apis/login-apis";
import { useLoginStore } from "../stores/login-store";

export const useAuthenticateUserMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { loginData, setStepNo, setTwoFACodeData, resetLoginProcess } = useLoginStore(
    useShallow((state) => ({
      loginData: state.loginData,
      setStepNo: state.setStepNo,
      setTwoFACodeData: state.setTwoFACodeData,
      resetLoginProcess: state.resetLoginProcess,
    })),
  );

  // Define mutation
  const { mutate: authenticateUserMutation, isPending: isAuthPending } = useMutation({
    mutationFn: authenticateUser,
    onSuccess: ({ data, message }) => {
      // Password  has expired
      if (message.includes(PWD_EXPIRED)) {
        // Ask to reset password
        toast.warning("Password expired", {
          description: message,
        });

        return;
      }

      // TwoFA is enabled
      if (message.includes(TWO_FA_ENABLED)) {
        // Set verification code id
        setTwoFACodeData({
          email: data.email,
          requestType: data.requestType,
          codeId: data.verificationCodeId,
        });

        // Move to stepNo-3 (TwoFA)
        setStepNo(3);

        return;
      }

      // ----------User is authenticated Now----------

      // Check if backend message indicates incomplete tenant setup
      if (message.includes(ADD_TENANT)) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else if (message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else {
        // Reset login process
        resetLoginProcess();

        // Set authenticated user locally
        const userSession = setUserSessionLocally(data);

        // Redirect to Atlas (Aventisia employees) or Workspace app
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        const destination = redirect
          ? decodeURIComponent(redirect)
          : getPostLoginDestination(userSession.email);

        navigate("/redirect?msg=Logging in...&url=" + destination);
      }
    },
    onError: (error) => {
      toast.error(error.toString());
      resetLoginProcess();
    },
  });

  // Define resend code handler
  const resend2FACodeHandler = () => {
    // store data is null
    if (!loginData) {
      toast.error("Something went wrong. Please try again.");
      resetLoginProcess();
      return;
    }

    // Try to Authenticate user
    authenticateUserMutation({
      email: loginData.email,
      pwd: loginData.pwd,
    });
  };

  // Return mutation and pending status
  return { authenticateUserMutation, resend2FACodeHandler, isAuthPending };
};
