import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
        setUserSessionLocally(data);

        // Redirect to workspace app
        navigate(
          "/redirect?msg=Logging in...&url=" +
            import.meta.env.VITE_WORKSPACE_PATH,
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
