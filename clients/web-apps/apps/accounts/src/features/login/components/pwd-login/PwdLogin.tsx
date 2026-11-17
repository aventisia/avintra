import { SeparatorWithText } from "@avplatform/ui";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { ContentContainer } from "@/components/ui/ContentContainer";

import { useLoginStore } from "../../stores/login-store";
import { GoToResetPwd } from "./GoToResetPwd";
import { LinkedProviderSignIn } from "./LinkedProviderSignIn";
import { PwdLoginForm } from "./PwdLoginForm";
import { PwdLoginHeader } from "./PwdLoginHeader";

export const PwdLogin = () => {
  // Set dcoument title
  useDocumentTitle("Login");

  // A linked provider is offered first; a passwordless account has nothing else
  const { socialLoginProvider, hasPassword } = useLoginStore(
    useShallow((state) => ({
      socialLoginProvider: state.socialLoginProvider,
      hasPassword: state.hasPassword,
    })),
  );

  const isSocialOnly = Boolean(socialLoginProvider) && !hasPassword;

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      {/* Back to Get Tenant Info + Email + Heading */}
      <PwdLoginHeader
        heading={isSocialOnly ? `This account uses ${socialLoginProvider}` : undefined}
      />

      {socialLoginProvider && (
        <>
          <LinkedProviderSignIn />
          {hasPassword && <SeparatorWithText width="98%" overlayText="or continue with password" />}
        </>
      )}

      {(!socialLoginProvider || hasPassword) && (
        <>
          {/* Pwd login */}
          <PwdLoginForm />

          {/* or Reset password */}
          <GoToResetPwd />
        </>
      )}
    </ContentContainer>
  );
};
