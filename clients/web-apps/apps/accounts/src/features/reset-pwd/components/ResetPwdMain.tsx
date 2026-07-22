import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer } from "@/components/ui/RightContainer";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";

import { useResetPwdStore } from "../stores/reset-pwd-store";
import { ProvideEmail } from "./provide-email/ProvideEmail";
import { ResetPwd } from "./reset-pwd/ResetPwd";
import { VerifyCode } from "./verify-code/VerifyCode";

export const ResetPwdMain = () => {
  // Get store state
  const { stepNo } = useResetPwdStore(
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
            href="/help?id=reset-pwd"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-right text-md",
              "hidden", // TODO: Hide the help link till we have a docs app
            )}
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

      <RightContainer
        heading="Your AI-Powered Journey Starts Here"
        subHeading="Enter your gateway to affordable, scalable, and practical automation."
        imgSrc="agentbuilder.svg"
      />
    </PageContainer>
  );
};
