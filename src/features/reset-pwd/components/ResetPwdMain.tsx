import { ProvideEmail, ResetPwd, useResetPwdStore, VerifyCode } from "@/features/reset-pwd";
import { AppLogo, MinimalFooter } from "@/react-toolkit/components/layout";
import { LeftContainer, RightContainer } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { HeaderContainer } from "@/components/layout";
import { cn } from "@/react-toolkit/lib";
import { buttonVariants } from "@/react-toolkit/components/ui";

export const ResetPwdMain = () => {
  // Get store state
  const { stepNo } = useResetPwdStore(
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
            href="/help?id=reset-pwd"
            className={cn(buttonVariants({ variant: "link" }), "text-right")}
          >
            Help?
          </a>
        </HeaderContainer>

        {/* Step 1 - Provide email step */}
        {stepNo === 1 && <ProvideEmail />}

        {/* Step 2 - Verify code step */}
        {stepNo === 2 && <VerifyCode />}

        {/* Step 3 - Reset pwd step */}
        {stepNo === 3 && <ResetPwd />}

        {/* App footer */}
        <MinimalFooter />
      </LeftContainer>
      <RightContainer></RightContainer>
    </>
  );
};
