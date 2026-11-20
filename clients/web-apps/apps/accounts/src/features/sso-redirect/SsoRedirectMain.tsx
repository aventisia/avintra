import { LoadingSpinner } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { SIGN_IN_CANCELLED, SOCIAL_STATE_PREFIX } from "@/constants/variables";
import { AuthShell, AuthStepLayout } from "@/features/auth";

import { useCompleteSsoAdminConsentMutation } from "./useCompleteSsoAdminConsentMutation";
import { useValidateEntraTokenMutation } from "./useValidateEntraTokenMutation";
import { useValidateSocialCallbackMutation } from "./useValidateSocialCallbackMutation.hook";

const getConsentErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;

  return message ?? "The identity provider connection could not be completed.";
};

/** The backend's own failure text; provider error descriptions are never shown. */
const getSocialErrorMessage = (error: unknown): string => {
  if (typeof error === "string" && error.length > 0) return error;

  return "We could not sign you in. Please try again.";
};

export const SsoRedirectMain = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const adminConsent = searchParams.get("admin_consent");
  const grantedTenantId = searchParams.get("tenant");

  const { validateEntraTokenMutation } = useValidateEntraTokenMutation();
  const { completeSsoAdminConsentMutation, consentError } = useCompleteSsoAdminConsentMutation();
  const { validateSocialCallbackMutation, socialCallbackError } =
    useValidateSocialCallbackMutation();

  const isSocialAttempt = Boolean(state && state.startsWith(SOCIAL_STATE_PREFIX));
  const hasStartedCallbackRef = useRef(false);

  useEffect(() => {
    if (error) return;

    // IMPORTANT NOTE: React StrictMode runs this mount effect twice; the callback consumes a
    // single-use state, so the second run would answer with a failure the person should not see.
    if (hasStartedCallbackRef.current) return;

    // Administrator consent returns the granted tenant without an authorization code
    if (adminConsent && grantedTenantId && state) {
      hasStartedCallbackRef.current = true;
      completeSsoAdminConsentMutation({ grantedTenantId, state });
      return;
    }

    if (code) {
      hasStartedCallbackRef.current = true;
      if (isSocialAttempt) validateSocialCallbackMutation({ code, state });
      else validateEntraTokenMutation({ code, state });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, state, error, adminConsent, grantedTenantId, isSocialAttempt]);

  const consentErrorMessage = consentError ? getConsentErrorMessage(consentError) : null;
  const socialErrorMessage = socialCallbackError
    ? getSocialErrorMessage(socialCallbackError)
    : null;

  // Cancelling at the provider is neutral: the provider's own error text is never rendered
  const failureMessage = error ? SIGN_IN_CANCELLED : (consentErrorMessage ?? socialErrorMessage);
  const isFailed = Boolean(failureMessage);
  const backHref = consentErrorMessage
    ? import.meta.env.VITE_WORKSPACE_PATH + "tenant/overview"
    : import.meta.env.VITE_ACCOUNTS_PATH + "login";

  return (
    <AuthShell>
      {isFailed ? (
        <AuthStepLayout
          title={
            consentErrorMessage ? "We couldn't connect single sign-on" : "We couldn't sign you in"
          }
          description={failureMessage}
        >
          <a
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
            href={backHref}
          >
            {consentErrorMessage ? "Back to preferences" : "Back to sign in"}
          </a>
        </AuthStepLayout>
      ) : (
        <div
          role="status"
          className="flex w-full max-w-[360px] items-center gap-3 text-body text-ink-2"
        >
          <LoadingSpinner className="size-5 text-live" />
          Signing you in…
        </div>
      )}
    </AuthShell>
  );
};
