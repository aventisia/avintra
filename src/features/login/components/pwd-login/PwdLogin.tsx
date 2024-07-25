import {
  BackToGetTenantInfo,
  GoToResetPwd,
  PwdLoginForm,
} from "@/features/login";
import { ContentContainer } from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const PwdLogin = () => {
  // Set dcoument title
  useDocumentTitle("Login");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      {/* Back to Get Tenant Info + Email */}
      <BackToGetTenantInfo />

      {/* Pwd login */}
      <PwdLoginForm />

      {/* or Reset password */}
      <GoToResetPwd />
    </ContentContainer>
  );
};
