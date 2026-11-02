import { toast } from "@avplatform/ui/sonner";
import { markFreshLogin, setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getPostLoginDestination } from "@/constants/post-login-destination";

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
  const { mutate: check2FACodeMutation, isPending: isCheckPending } = useMutation({
    mutationFn: checkTwoFAVerificationCode,
    onSuccess: ({ data }) => {
      // Reset login process
      resetLoginProcess();

      // Set authenticated user locally
      markFreshLogin();
      const userSession = setUserSessionLocally(data);

      // Redirect to Atlas (Aventisia employees) or Workspace app
      navigate("/redirect?msg=Logging in...&url=" + getPostLoginDestination(userSession.email));
    },
    onError: (error) => {
      toast.error(error.toString());
      resetLoginProcess();
    },
  });

  // Return mutation and pending status
  return { check2FACodeMutation, isCheckPending };
};
