import {
  getDesktopConfirmationAppPath,
  getDesktopConfirmationPath,
} from "@/constants/desktop-intent.util";
import {
  buildOnboardingUrl,
  getPostLoginDestination,
  resolvePostLoginDestination,
} from "@/constants/post-login-destination";
import { getSameOriginRedirectPath } from "@/features/sso-redirect/utils/same-origin-redirect.util";

type SocialSignInIntent = { redirectUrl: string | null; hasPlanIntent: boolean };

/** The `/redirect` screen path that shows `msg` while it sends the browser on to `destination`. */
const buildRedirectPath = (destination: string, msg = "Logging in...") =>
  `/redirect?msg=${encodeURIComponent(msg)}&url=${encodeURIComponent(destination)}`;

/** The next screen after a sign-in: the desktop confirmation during a hand-back, else the redirect screen. */
const getPostLoginPath = (email: string): string =>
  getDesktopConfirmationPath() ?? buildRedirectPath(resolvePostLoginDestination(email));

/**
 * Where a Google or GitHub sign-in lands: onboarding when a paid plan was chosen, otherwise the
 * same-origin page it started from, the desktop confirmation during a hand-back, or the default app.
 */
const getSocialSignInDestination = (
  { redirectUrl, hasPlanIntent }: SocialSignInIntent,
  email: string,
): string => {
  if (hasPlanIntent) return buildOnboardingUrl(true);

  return (
    getSameOriginRedirectPath(redirectUrl, window.location.origin) ??
    getDesktopConfirmationAppPath() ??
    getPostLoginDestination(email)
  );
};

export { buildRedirectPath, getPostLoginPath, getSocialSignInDestination };
