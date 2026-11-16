import { getSocialLoginUrl } from "@avplatform/ui/apis/accounts-auth-apis";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { hasPlanIntent } from "@/constants/post-login-destination";

/** Starts a Google or GitHub sign-in by sending the browser to the provider. */
const useSocialSignInMutation = () => {
  const { mutate: socialSignInMutation, isPending: isSignInPending } = useMutation({
    mutationFn: (provider: string) =>
      getSocialLoginUrl(
        provider,
        new URLSearchParams(window.location.search).get("redirect"),
        hasPlanIntent(),
      ),
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

  return { socialSignInMutation, isSignInPending };
};

export { useSocialSignInMutation };
