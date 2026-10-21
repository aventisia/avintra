import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION, SSO_DISABLED } from "@/constants/variables";
import { getPostLoginDestination } from "@/constants/post-login-destination";

import { validateEntraToken } from "./sso-redirect-apis";

export const useValidateEntraTokenMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Define mutation
  const { mutate: validateEntraTokenMutation } = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string | null }) =>
      validateEntraToken(code, state),
    onSuccess: ({ data, message }) => {
      // Check if backend message indicates incomplete tenant setup
      if (message.includes(ADD_TENANT)) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else if (message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        window.location.href = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else {
        // Set authenticated user locally
        const userSession = setUserSessionLocally(data);

        const redirect = new URLSearchParams(window.location.search).get("redirect");
        window.location.assign(
          redirect ? decodeURIComponent(redirect) : getPostLoginDestination(userSession.email),
        );
      }
    },
    onError: (error) => {
      if (error.toString().includes(SSO_DISABLED)) {
        navigate("/login?ssoDisabled=1");
        return;
      }

      navigate("/login");
    },
  });

  // Return mutation and pending status
  return { validateEntraTokenMutation };
};
