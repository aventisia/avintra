import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
        if (message.includes("Your password has been expired")) {
          // Ask to reset password
          toast.warning("Password expired", {
            description: message,
          });

          return;
        }

        // TwoFA is enabled
        if (message.includes("TwoFA is enabled")) {
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

        // Reset login process
        resetLoginProcess();

        // Set authenticated user locally
        const userSessionStoreObj = setUserSessionLocally(data);

        // Route as per user type (internal or external)
        navigate(
          "/redirect?msg=Logging in...&url=" +
            (userSessionStoreObj.isAE
              ? import.meta.env.VITE_WORKSPACE_URL
              : import.meta.env.VITE_WORKSPACE_URL),
        );
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
