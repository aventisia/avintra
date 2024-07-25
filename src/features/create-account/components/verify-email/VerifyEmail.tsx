import {
  BackToCreateAccount,
  ResendVerifyEmailCode,
  VerifyEmailForm,
} from "@/features/create-account";
import { ContentHeader, ContentContainer } from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const VerifyEmail = () => {
  // Set dcoument title
  useDocumentTitle("Verify Email Address");

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
