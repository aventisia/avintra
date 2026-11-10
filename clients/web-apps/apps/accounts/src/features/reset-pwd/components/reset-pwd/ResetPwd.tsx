import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";

import { BackToLogin } from "../BackToLogin";
import { ResetPwdForm } from "./ResetPwdForm";

export const ResetPwd = () => {
  // Set dcoument title
  useDocumentTitle("Reset password");

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
