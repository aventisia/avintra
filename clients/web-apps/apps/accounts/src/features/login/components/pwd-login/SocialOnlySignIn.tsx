import { useShallow } from "zustand/react/shallow";

import { SocialButtons } from "@/components/ui/SocialButtons";
import { useSocialSignInMutation } from "@/features/social-sign-in";

import { useLoginStore } from "../../stores/login-store";

/**
 * Step two of a passwordless account: it can only sign in with the provider it is linked to.
 */
export const SocialOnlySignIn = () => {
  const { socialLoginProvider } = useLoginStore(
    useShallow((state) => ({
      socialLoginProvider: state.socialLoginProvider,
    })),
  );

  const { socialSignInMutation, isSignInPending } = useSocialSignInMutation();

  if (!socialLoginProvider) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <SocialButtons
        providers={{
          google: socialLoginProvider === "Google",
          gitHub: socialLoginProvider === "GitHub",
        }}
        disabled={isSignInPending}
        onProviderClick={socialSignInMutation}
      />
    </div>
  );
};
