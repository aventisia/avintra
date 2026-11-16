import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { useCompleteSocialSignIn } from "@/features/social-sign-in";

import { validateSocialCallback } from "./sso-redirect-apis";

/** Completes a Google or GitHub sign-in from the callback query parameters. */
export const useValidateSocialCallbackMutation = () => {
  const { completeSocialSignIn } = useCompleteSocialSignIn();
  const [socialCallbackError, setSocialCallbackError] = useState<unknown>(null);

  const { mutate: validateSocialCallbackMutation } = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string | null }) =>
      validateSocialCallback(code, state),
    onSuccess: ({ data }) => {
      completeSocialSignIn(data);
    },
    onError: (error) => setSocialCallbackError(error),
  });

  return { validateSocialCallbackMutation, socialCallbackError };
};
