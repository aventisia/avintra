import { buildOnboardingUrl, getPostLoginDestination } from "@/constants/post-login-destination";
import { getSameOriginRedirectPath } from "@/features/sso-redirect/utils/same-origin-redirect.util";

type SocialSignInIntent = { redirectUrl: string | null; hasPlanIntent: boolean };

/** The `/redirect` screen path that shows `msg` while it sends the browser on to `destination`. */
const buildRedirectPath = (destination: string, msg = "Logging in...") =>
  `/redirect?msg=${encodeURIComponent(msg)}&url=${encodeURIComponent(destination)}`;

/**
 * Where a Google or GitHub sign-in lands: onboarding when a paid plan was chosen, otherwise the
 * same-origin page it started from, or the default app.
 */
const getSocialSignInDestination = (
  { redirectUrl, hasPlanIntent }: SocialSignInIntent,
  email: string,
): string => {
  if (hasPlanIntent) return buildOnboardingUrl(true);

  return (
    getSameOriginRedirectPath(redirectUrl, window.location.origin) ?? getPostLoginDestination(email)
  );
};

export { buildRedirectPath, getSocialSignInDestination };
