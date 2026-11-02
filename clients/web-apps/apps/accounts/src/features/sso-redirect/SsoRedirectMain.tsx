import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { LoadingSpinner } from "@avplatform/ui";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useCompleteSsoAdminConsentMutation } from "./useCompleteSsoAdminConsentMutation";
import { useValidateEntraTokenMutation } from "./useValidateEntraTokenMutation";

const getConsentErrorMessage = (error: unknown): string => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;

  return message ?? "The identity provider connection could not be completed.";
};

export const SsoRedirectMain = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const adminConsent = searchParams.get("admin_consent");
  const grantedTenantId = searchParams.get("tenant");

  const { validateEntraTokenMutation } = useValidateEntraTokenMutation();
  const { completeSsoAdminConsentMutation, consentError } = useCompleteSsoAdminConsentMutation();

  useEffect(() => {
    if (error) return;

    // Administrator consent returns the granted tenant without an authorization code
    if (adminConsent && grantedTenantId && state) {
      completeSsoAdminConsentMutation({ grantedTenantId, state });
      return;
    }

    if (code) {
      validateEntraTokenMutation({ code, state });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, state, error, adminConsent, grantedTenantId]);

  const consentErrorMessage = consentError ? getConsentErrorMessage(consentError) : null;
  const failureMessage = error
    ? (errorDescription ?? "The identity provider returned an error.")
    : consentErrorMessage;
  const isFailed = Boolean(failureMessage);
  const backHref = error
    ? import.meta.env.VITE_ACCOUNTS_PATH + "login"
    : import.meta.env.VITE_WORKSPACE_PATH + "tenant/overview";

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between p-3 pb-3 lg:w-[100%]">
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        <AppLogo showFullLogo={true} className="h-7" />
      </div>
      {isFailed ? (
        <div className="-mt-4 flex flex-col items-center gap-3 text-center text-md">
          <p className="font-medium text-destructive">
            {consentErrorMessage
              ? "We could not connect single sign-on."
              : "We could not sign you in."}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">{failureMessage}</p>
          <a
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={backHref}
          >
            {consentErrorMessage ? "Back to preferences" : "Back to login"}
          </a>
        </div>
      ) : (
        <div className="-mt-4 flex items-center gap-4 text-md">
          <LoadingSpinner className="size-7 text-primary" />
          Logging you in...
        </div>
      )}
      <MinimalFooter />
    </div>
  );
};
