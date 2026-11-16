import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";

import { BackToLogin } from "../BackToLogin";
import { ProvideEmailForm } from "./ProvideEmailForm";

export const ProvideEmail = () => {
  // Set dcoument title
  useDocumentTitle("Reset password");

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
