import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { RightContainer } from "@/components/ui/RightContainer";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { useShallow } from "zustand/react/shallow";
import { useCreateAccountStore } from "../stores/create-account-store";
import { CreateAccount } from "./create-account/CreateAccount";
import { VerifyEmail } from "./verify-email/VerifyEmail";

export const CreateAccountMain = () => {
  // Get store state
  const { stepNo } = useCreateAccountStore(
    useShallow((state) => ({
      stepNo: state.stepNo,
    })),
  );

  // Return component
  return (
    <>
      <LeftContainer>
        <HeaderContainer>
          <AppLogo />
          <a
            href="/help?id=create-account"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-md text-right",
            )}
          >
            Help?
          </a>
        </HeaderContainer>

        {/* Step 1 - Create account step */}
        {stepNo === 1 && <CreateAccount />}

        {/* Step 2 - Verify email address step */}
        {stepNo === 2 && <VerifyEmail />}

        {/* App footer */}
        <MinimalFooter />
      </LeftContainer>

      <RightContainer
        heading="Discover Scalable AI-Powered Workflows"
        subHeading="Sign up to build intuitive, AI-powered workflows tailored to your needs."
        imgSrc="flowbuilder.svg"
      />
    </>
  );
};
