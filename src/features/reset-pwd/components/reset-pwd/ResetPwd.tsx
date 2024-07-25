import { BackToLogin, ResetPwdForm } from "@/features/reset-pwd";
import { ContentHeader, ContentContainer } from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const ResetPwd = () => {
  // Set dcoument title
  useDocumentTitle("Reset Password");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Reset password"
        smallerHeading="Must be at least 8 characters"
      />

      {/* Reset form to provide new pwd */}
      <ResetPwdForm />

      {/* Back to login */}
      <BackToLogin />
    </ContentContainer>
  );
};
