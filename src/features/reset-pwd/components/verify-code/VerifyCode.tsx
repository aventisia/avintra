import { VerifyCodeForm, ResendResetPwdCode, BackToLogin } from "@/features/reset-pwd";
import { ContentHeader, ContentContainer } from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const VerifyCode = () => {
  // Set dcoument title
  useDocumentTitle("Verify Code");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Verify your email"
        smallerHeading="Please enter the verification code sent to your email"
      />

      {/* Verify code form to enter verification Code */}
      <VerifyCodeForm />

      {/* Resend code section */}
      <ResendResetPwdCode />

      {/* Back to login link */}
      <BackToLogin />
    </ContentContainer>
  );
};
