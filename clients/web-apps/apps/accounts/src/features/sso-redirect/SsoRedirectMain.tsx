import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { LoadingSpinner } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer } from "@/components/ui/RightContainer";

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
    <PageContainer>
      <LeftContainer>
        <HeaderContainer>
          <AppLogo showFullLogo={true} className="h-7" />
        </HeaderContainer>
        <ContentContainer>
          {isFailed ? (
            <>
              <ContentHeader
                biggerHeading={
                  consentErrorMessage
                    ? "We couldn't connect single sign-on"
                    : "We couldn't sign you in"
                }
                smallerHeading={failureMessage ?? ""}
              />
              <a
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
                href={backHref}
              >
                {consentErrorMessage ? "Back to preferences" : "Back to sign in"}
              </a>
            </>
          ) : (
            <div role="status" className="flex items-center gap-3 text-body text-ink-2">
              <LoadingSpinner className="size-5 text-live" />
              Signing you in…
            </div>
          )}
        </ContentContainer>
        <MinimalFooter />
      </LeftContainer>
      <RightContainer />
    </PageContainer>
  );
};
