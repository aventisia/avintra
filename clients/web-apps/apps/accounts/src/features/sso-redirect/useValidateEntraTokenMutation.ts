import { ADD_TENANT, NO_ACTIVE_SUBSCRIPTION } from "@/react-toolkit/constants";
import { setUserSessionLocally } from "@/react-toolkit/utils/user-session-utils";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { validateEntraToken } from "./sso-redirect-apis";

export const useValidateEntraTokenMutation = () => {
  // Get navigate function
  const navigate = useNavigate();

  // Define mutation
  const { mutate: validateEntraTokenMutation } = useMutation({
    mutationFn: validateEntraToken,
    onSuccess: ({ data, message }) => {
      // Check if backend message indicates incomplete tenant setup
      if (message.includes(ADD_TENANT)) {
        window.location.href =
          import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else if (message.includes(NO_ACTIVE_SUBSCRIPTION)) {
        window.location.href =
          import.meta.env.VITE_ACCOUNTS_PATH + "onboarding";
      } else {
        // Set authenticated user locally
        setUserSessionLocally(data);

        // Redirect to workspace app
        window.location.assign(import.meta.env.VITE_WORKSPACE_PATH);
      }
    },
    onError: () => {
      navigate("/login");
    },
  });

  // Return mutation and pending status
  return { validateEntraTokenMutation };
};
