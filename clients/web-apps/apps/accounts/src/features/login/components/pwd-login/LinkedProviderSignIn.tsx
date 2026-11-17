import { useShallow } from "zustand/react/shallow";

import { SocialButtons } from "@/components/ui/SocialButtons";
import { useSocialSignInMutation } from "@/features/social-sign-in";

import { useLoginStore } from "../../stores/login-store";

/**
 * Offers the provider a social account is linked to. It is the only way in when the account has no
 * password, and sits above the password form when it has one.
 */
export const LinkedProviderSignIn = () => {
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
