import { CreateAccountForm, GoToLogin } from "@/features/create-account";
import {
  SeparatorWithText,
} from "@/react-toolkit/components/ui";
import {
  SocialButtons,
  ContentHeader,
  ContentContainer,
} from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const CreateAccount = () => {
  // Set dcoument title
  useDocumentTitle("Create Account");

  // Return component
  return (
    <ContentContainer className="fadeInRTL">
      <ContentHeader
        biggerHeading="Create account"
        smallerHeading="Select method to sign up:"
      ></ContentHeader>

      {/* Social sign up options */}
      <SocialButtons />

      {/* Separator */}
      <SeparatorWithText overlayText="or" />

      {/* Create account form */}
      <CreateAccountForm />

      {/* Have an account? Login component */}
      <GoToLogin />
    </ContentContainer>
  );
};
