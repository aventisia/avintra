import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { ContentContainer } from "@/components/ui/ContentContainer";

import { useLoginStore } from "../../stores/login-store";
import { GoToResetPwd } from "./GoToResetPwd";
import { PwdLoginForm } from "./PwdLoginForm";
import { PwdLoginHeader } from "./PwdLoginHeader";
import { SocialOnlySignIn } from "./SocialOnlySignIn";

export const PwdLogin = () => {
  // Set dcoument title
  useDocumentTitle("Login");

  // A passwordless account signs in with its provider instead of a password
  const { socialLoginProvider } = useLoginStore(
    useShallow((state) => ({
      socialLoginProvider: state.socialLoginProvider,
    })),
  );

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      {/* Back to Get Tenant Info + Email + Heading */}
      <PwdLoginHeader
        heading={socialLoginProvider ? `This account uses ${socialLoginProvider}` : undefined}
      />

      {socialLoginProvider ? (
        /* Social-only account */
        <SocialOnlySignIn />
      ) : (
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
