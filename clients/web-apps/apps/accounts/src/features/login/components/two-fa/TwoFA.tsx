import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";

import { BackToLogin } from "./BackToLogin";
import { Resend2FACode } from "./Resend2FACode";
import { TwoFAForm } from "./TwoFAForm";

export const TwoFA = () => {
  // Set dcoument title
  useDocumentTitle("Two Factor Authentication");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Two-factor authentication"
        smallerHeading="Two-factor authentication is enabled for your account. Please
        enter the code sent to your email"
      />

      {/* TwoFA form to enter verification Code */}
      <TwoFAForm />

      {/* Resend 2FA code */}
      <Resend2FACode />

      {/* Back to login link */}
      <BackToLogin />
    </ContentContainer>
  );
};
