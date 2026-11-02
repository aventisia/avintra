import { toast } from "@avplatform/ui/sonner";
import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getPostLoginDestination } from "@/constants/post-login-destination";
import {
  ADD_TENANT,
  NO_ACTIVE_SUBSCRIPTION,
  PWD_EXPIRED,
  SSO_DISABLED,
  TWO_FA_ENABLED,
} from "@/constants/variables";

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

      if (message.includes(ADD_TENANT) || message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else {
        // Reset login process
        resetLoginProcess();

        // Set authenticated user locally
        markFreshLogin();
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
    onError: (error: unknown) => {
      if (typeof error === "string" && error.includes(SSO_DISABLED)) {
        toast.warning("Single sign-on disabled", {
          description: `${error}. Set a password with Forgot password to sign in.`,
        });

        resetLoginProcess();
        return;
      }

      toast.error(String(error));
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
