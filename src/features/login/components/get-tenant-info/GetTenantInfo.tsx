import { GetTenantInfoForm, GoToCreateAccount } from "@/features/login";
import { SeparatorWithText } from "@/react-toolkit/components/ui";
import {
  SocialButtons,
  ContentHeader,
  ContentContainer,
} from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const GetTenantInfo = () => {
  // Set dcoument title
  useDocumentTitle("Login");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Log in to your account"
        smallerHeading="Select method to Log in:"
      />

      {/* Social sign in options */}
      <SocialButtons />

      {/* Separator */}
      <SeparatorWithText width="98%" overlayText="or continue with email" />

      {/* Get Tenant Info form */}
      <GetTenantInfoForm />

      {/* Don't have an account? Create free account */}
      <GoToCreateAccount />
    </ContentContainer>
  );
};
