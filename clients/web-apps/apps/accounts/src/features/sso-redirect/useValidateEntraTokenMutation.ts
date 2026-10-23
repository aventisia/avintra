import { toast } from "@avplatform/ui/sonner";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getPostLoginDestination } from "@/constants/post-login-destination";
import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION, SSO_DISABLED } from "@/constants/variables";

import { validateEntraToken } from "./sso-redirect-apis";

const getSameOriginRedirectPath = (redirect: string | null): string | null => {
  if (!redirect) return null;

  let path: string;
  try {
    path = decodeURIComponent(redirect);
  } catch {
    return null;
  }

  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;

  return path;
};

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

        const redirect = getSameOriginRedirectPath(
          new URLSearchParams(window.location.search).get("redirect"),
        );
        window.location.assign(redirect ?? getPostLoginDestination(userSession.email));
      }
    },
    onError: (error) => {
      if (error.toString().includes(SSO_DISABLED)) {
        toast.error("Single sign-on is disabled. Set a password to sign in.");
        navigate("/login?ssoDisabled=1");
        return;
      }

      toast.error("We could not sign you in. Please try again.");
      navigate("/login");
    },
  });

  // Return mutation and pending status
  return { validateEntraTokenMutation };
};
