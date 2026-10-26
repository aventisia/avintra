import { toast } from "@avplatform/ui/sonner";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getPostLoginDestination } from "@/constants/post-login-destination";
import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "@/constants/variables";

import { validateEntraToken } from "./sso-redirect-apis";
import { getSameOriginRedirectPath } from "./utils/same-origin-redirect.util";

export const useValidateEntraTokenMutation = () => {
  const navigate = useNavigate();

  const { mutate: validateEntraTokenMutation } = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string | null }) =>
      validateEntraToken(code, state),
    onSuccess: ({ data, message }) => {
      if (message.includes(ADD_TENANT) || message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else {
        const userSession = setUserSessionLocally(data);

        const redirect = getSameOriginRedirectPath(
          new URLSearchParams(window.location.search).get("redirect"),
          window.location.origin,
        );
        window.location.assign(redirect ?? getPostLoginDestination(userSession.email));
      }
    },
    onError: () => {
      toast.error("We could not sign you in. Please try again.");
      navigate("/login");
    },
  });

  return { validateEntraTokenMutation };
};
