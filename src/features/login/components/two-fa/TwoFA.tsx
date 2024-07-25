import { BackToLogin, Resend2FACode, TwoFAForm } from "@/features/login";
import { ContentHeader, ContentContainer } from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

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
