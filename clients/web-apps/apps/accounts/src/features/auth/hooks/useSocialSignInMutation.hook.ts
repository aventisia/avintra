import { getSocialLoginUrl } from "@avplatform/ui/apis/accounts-auth-apis";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { hasPlanIntent } from "@/constants/post-login-destination";
import { getSameOriginRedirectPath } from "@/features/sso-redirect/utils/same-origin-redirect.util";

/** Starts a Google or GitHub sign-in by sending the browser to the provider. */
const useSocialSignInMutation = () => {
  const {
    mutate: socialSignInMutation,
    isPending,
    variables,
  } = useMutation({
    mutationFn: (provider: string) => {
      const redirect = new URLSearchParams(window.location.search).get("redirect");

      return getSocialLoginUrl(
        provider,
        getSameOriginRedirectPath(redirect, window.location.origin),
        hasPlanIntent(),
      );
    },
    onSuccess: ({ data }) => {
      if (!data) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      window.location.assign(data);
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  return { socialSignInMutation, pendingProvider: isPending ? variables : undefined };
};

export { useSocialSignInMutation };
