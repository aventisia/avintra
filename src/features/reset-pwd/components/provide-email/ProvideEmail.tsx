import { BackToLogin, ProvideEmailForm } from "@/features/reset-pwd";
import { ContentHeader, ContentContainer } from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const ProvideEmail = () => {
  // Set dcoument title
  useDocumentTitle("Reset Password");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Want to reset your password?"
        smallerHeading="No worries, we'll send you reset instructions"
      />

      {/* Provide email form */}
      <ProvideEmailForm />

      {/* Back to login */}
      <BackToLogin />
    </ContentContainer>
  );
};
