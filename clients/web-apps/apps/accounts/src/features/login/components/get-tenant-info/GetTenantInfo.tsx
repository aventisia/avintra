import { IS_TAURI } from "@avplatform/ui/constants";
//import { SocialButtons } from "@/components/ui/SocialButtons";
import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";

// import { SeparatorWithText } from "@/react-toolkit/ui/SeparatorWithText";
import { GetTenantInfoForm } from "./GetTenantInfoForm";
import { GoToCreateAccount } from "./GoToCreateAccount";

export const GetTenantInfo = () => {
  // Set dcoument title
  useDocumentTitle("Login");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Log in to your account"
        smallerHeading="Enter your email address"
      />

      {/* Social sign in options */}
      {/* <SocialButtons /> */}

      {/* Separator */}
      {/* <SeparatorWithText width="98%" overlayText="or continue with email" /> */}

      {/* Get Tenant Info form */}
      <GetTenantInfoForm />

      {/* Don't have an account? Create free account */}
      {!IS_TAURI && <GoToCreateAccount />}
    </ContentContainer>
  );
};
