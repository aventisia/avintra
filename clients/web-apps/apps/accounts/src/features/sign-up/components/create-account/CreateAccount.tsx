import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";
import { SocialSignInBlock } from "@/features/social-sign-in";

import { CreateAccountForm } from "./CreateAccountForm";
import { GoToLogin } from "./GoToLogin";

export const CreateAccount = () => {
  // Set dcoument title
  useDocumentTitle("Create account");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Create account"
        smallerHeading="Enter your details to get started"
      />

      {/* Social sign up options (hidden on desktop) */}
      <SocialSignInBlock />

      {/* Create account form */}
      <CreateAccountForm />

      {/* Have an account? Login component */}
      <GoToLogin />
    </ContentContainer>
  );
};
