import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";

import { BackToCreateAccount } from "./BackToCreateAccount";
import { ResendVerifyEmailCode } from "./ResendVerifyEmailCode";
import { VerifyEmailForm } from "./VerifyEmailForm";

export const VerifyEmail = () => {
  // Set dcoument title
  useDocumentTitle("Verify email address");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Verify your email"
        smallerHeading="Please enter the verification code sent to your email"
      />

      {/* Verify email form to enter verification Code */}
      <VerifyEmailForm />

      {/* Resend code section */}
      <ResendVerifyEmailCode />

      {/* Back to create account link */}
      <BackToCreateAccount />
    </ContentContainer>
  );
};
