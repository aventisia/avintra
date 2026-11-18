import { useCarryParams } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { resetPwd } from "../apis/auth.apis";
import { useAuthStore } from "../stores/auth-store";

/** Saves the new password, then opens the password step so the person can sign in with it. */
const useResetPwdMutation = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const withQueryParams = useCarryParams(["plan", "currency", "frequency", "redirect"]);
  const continueAs = useAuthStore((state) => state.continueAs);

  const { mutate: resetPwdMutation, isPending: isResetPending } = useMutation({
    mutationFn: resetPwd,
    onSuccess: ({ message }) => {
      toast.success(message, { className: "sonner-toaster-sm" });
      continueAs(useAuthStore.getState().email, "password");
      if (pathname !== "/login") navigate(withQueryParams("/login"), { replace: true });
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  return { resetPwdMutation, isResetPending };
};

export { useResetPwdMutation };
