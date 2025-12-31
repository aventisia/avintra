import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";

import { BackToLogin } from "../BackToLogin";
import { ResendResetPwdCode } from "./ResendResetPwdCode";
import { VerifyCodeForm } from "./VerifyCodeForm";

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
