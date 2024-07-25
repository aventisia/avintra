import { checkTwoFAVerificationCode, useLoginStore } from "@/features/login";
import { setUserSessionLocally } from "@/react-toolkit/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

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

        // Route as per user type (internal or external)
        navigate(
          "/redirect?msg=Logging in...&url=" +
            (userSessionStoreObj.isAE
              ? import.meta.env.VITE_INTRANET_CENTER_URL
              : import.meta.env.VITE_WORKSPACE_URL),
        );
      },
      onError: () => {
        // Reset login process
        resetLoginProcess();
      },
    });

  // Return mutation and pending status
  return { check2FACodeMutation, isCheckPending };
};
