import { AppLogo, MinimalFooter } from "@/react-toolkit/components/layout";
import { HeaderContainer } from "@/components/layout";
import { LeftContainer, RightContainer } from "@/components/ui";
import { buttonVariants } from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
import {
  CreateAccount,
  useCreateAccountStore,
  VerifyEmail,
} from "@/features/create-account";
import { useShallow } from "zustand/react/shallow";

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
            className={cn(buttonVariants({ variant: "link" }), "text-right")}
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
      <RightContainer></RightContainer>
    </>
  );
};
