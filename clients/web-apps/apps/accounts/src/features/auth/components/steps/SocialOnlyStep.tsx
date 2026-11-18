import { Button } from "@avplatform/ui/buttons";

import { useSocialSignInMutation } from "../../hooks/useSocialSignInMutation.hook";
import { useAuthStore } from "../../stores/auth-store";
import { isSocialProvider } from "../../utils/social-provider.util";
import { AuthStepLayout } from "../AuthStepLayout";
import { IdentityChip } from "../IdentityChip";
import { PROVIDER_LOGOS, SocialButtons } from "../SocialButtons";

/**
 * An account without a password whose provider sign-in could not start on its own; it offers the
 * provider button again.
 */
const SocialOnlyStep = () => {
  const email = useAuthStore((state) => state.email);
  const provider = useAuthStore((state) => state.socialLoginProvider) ?? "";
  const { socialSignInMutation, pendingProvider } = useSocialSignInMutation();

  const ProviderLogo = isSocialProvider(provider) ? PROVIDER_LOGOS[provider] : null;

  return (
    <AuthStepLayout
      title={`Continue with ${provider}`}
      description={`This account signs in with ${provider}, so there's no password to enter.`}
      identity={
        <IdentityChip
          email={email}
          leading={ProviderLogo && <ProviderLogo className="size-3.5 text-ink" />}
        />
      }
    >
      {isSocialProvider(provider) ? (
        <SocialButtons
          providers={[provider]}
          onProviderClick={socialSignInMutation}
          pendingProvider={pendingProvider}
        />
      ) : (
        <Button
          className="w-full"
          variant="outline"
          size="lg"
          disabled={Boolean(pendingProvider)}
          onClick={() => socialSignInMutation(provider)}
        >
          Continue with {provider}
        </Button>
      )}
    </AuthStepLayout>
  );
};

export { SocialOnlyStep };
