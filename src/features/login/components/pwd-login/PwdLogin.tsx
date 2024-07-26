import { ContentContainer } from "@/components/ui/ContentContainer";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { PwdLoginHeader } from "./PwdLoginHeader";
import { GoToResetPwd } from "./GoToResetPwd";
import { PwdLoginForm } from "./PwdLoginForm";

export const PwdLogin = () => {
  // Set dcoument title
  useDocumentTitle("Login");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      {/* Back to Get Tenant Info + Email + Heading */}
      <PwdLoginHeader />

      {/* Pwd login */}
      <PwdLoginForm />

      {/* or Reset password */}
      <GoToResetPwd />
    </ContentContainer>
  );
};
