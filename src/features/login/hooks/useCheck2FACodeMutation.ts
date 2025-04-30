import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { checkTwoFAVerificationCode } from "../apis/login-apis";
import { useLoginStore } from "../stores/login-store";

export const useCheck2FACodeMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Get store state and actions
  const { resetLoginProcess } = useLoginStore(
    useShallow((state) => ({
      resetLoginProcess: state.resetLoginProcess,
    })),
  );

  // Define mutation
  const { mutate: check2FACodeMutation, isPending: isCheckPending } =
    useMutation({
      mutationFn: checkTwoFAVerificationCode,
      onSuccess: ({ data }) => {
        // Reset login process
        resetLoginProcess();

        // Set authenticated user locally
        const userSessionStoreObj = setUserSessionLocally(data);

        // TODO: Route as per user type (internal or external)
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

  // Return mutation and pending status
  return { check2FACodeMutation, isCheckPending };
};
