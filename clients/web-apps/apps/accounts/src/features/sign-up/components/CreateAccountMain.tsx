import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer } from "@/components/ui/RightContainer";

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
    <PageContainer>
      <LeftContainer>
        <HeaderContainer>
          <AppLogo showFullLogo={true} className="h-7" />
          <a
            href="/help?id=create-account"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-right text-md",
              "hidden", // TODO: Hide the help link till we have a docs app
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
        imgSrc="agentbuilder.svg"
      />
    </PageContainer>
  );
};
