import {
  ADD_TENANT,
  DEV_JWT_LS_KEY,
  NO_ACTIVE_SUBSCRIPTION,
  PWD_EXPIRED,
  TWO_FA_ENABLED,
} from "@/react-toolkit/constants";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { authenticateUser } from "../apis/login-apis";
import { useLoginStore } from "../stores/login-store";

export const useAuthenticateUserMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { loginData, setStepNo, setTwoFACodeData, resetLoginProcess } =
    useLoginStore(
      useShallow((state) => ({
        loginData: state.loginData,
        setStepNo: state.setStepNo,
        setTwoFACodeData: state.setTwoFACodeData,
        resetLoginProcess: state.resetLoginProcess,
      })),
    );

  // Define mutation
  const { mutate: authenticateUserMutation, isPending: isAuthPending } =
    useMutation({
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

        // TODO: To be removed
        if (import.meta.env.DEV) {
          localStorage.setItem(DEV_JWT_LS_KEY, data.accessToken);
        }

        // Check if backend message indicates incomplete tenant setup
        if (message.includes(ADD_TENANT)) {
          window.location.href =
            import.meta.env.VITE_ACCOUNTS_URL + "/onboarding";
        } else if (message.includes(NO_ACTIVE_SUBSCRIPTION)) {
          window.location.href =
            import.meta.env.VITE_ACCOUNTS_URL + "/onboarding";
        } else {
          // Reset login process
          resetLoginProcess();

          // Set authenticated user locally
          const userSessionStoreObj = setUserSessionLocally(data);

          // TODO: Route as per user type (internal or external)
          navigate(
            "/redirect?msg=Logging in...&url=" +
              (userSessionStoreObj.isAE
                ? import.meta.env.VITE_WORC_URL
                : import.meta.env.VITE_WORC_URL),
          );
        }
      },
      onError: () => {
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
