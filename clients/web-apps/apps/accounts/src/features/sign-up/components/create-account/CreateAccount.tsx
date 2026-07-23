//import { SocialButtons } from "@/components/ui/SocialButtons";
import { useDocumentTitle } from "@avplatform/ui/hooks";

import { ContentContainer } from "@/components/ui/ContentContainer";
import { ContentHeader } from "@/components/ui/ContentHeader";

//import { SeparatorWithText } from "@/react-toolkit/ui/SeparatorWithText";
import { CreateAccountForm } from "./CreateAccountForm";
import { GoToLogin } from "./GoToLogin";

export const CreateAccount = () => {
  // Set dcoument title
  useDocumentTitle("Create Account");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Create account"
        smallerHeading="Enter your details to get started"
      />

      {/* Social sign up options */}
      {/* <SocialButtons /> */}

      {/* Separator */}
      {/* <SeparatorWithText overlayText="or" /> */}

      {/* Create account form */}
      <CreateAccountForm />

      {/* Have an account? Login component */}
      <GoToLogin />
    </ContentContainer>
  );
};
