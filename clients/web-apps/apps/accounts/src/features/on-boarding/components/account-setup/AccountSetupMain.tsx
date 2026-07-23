import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer } from "@/components/ui/RightContainer";
import { useCompanyInfoStore } from "@/features/on-boarding/stores/company-info-store";

import { CompanyInfo } from "./company-info/CompanyInfo";
import { UserInfo } from "./user-info/UserInfo";
import { UserType } from "./user-type/UserType";

export const AccountSetupMain = () => {
  // Get store state
  const { stepNo } = useCompanyInfoStore(
    useShallow((state) => ({
      stepNo: state.stepNo,
    })),
  );

  // Return component
  return (
    <>
      <PageContainer>
        <LeftContainer className="lg:w-[60%]">
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

          {/* Step 1 - Select user type */}
          {stepNo === 1 && <UserType />}

          {/* Step 2 - If Organization selected */}
          {stepNo === 2 && <CompanyInfo />}

          {/* Step 3 - If Individual selected */}
          {stepNo === 3 && <UserInfo />}
          {/* App footer */}
          <MinimalFooter />
        </LeftContainer>

        <RightContainer
          heading="Discover Scalable AI-Powered Workflows"
          subHeading="Sign up to build intuitive, AI-powered workflows tailored to your needs."
          imgSrc="agentbuilder.svg"
          className="lg:w-[40%]"
        />
      </PageContainer>
    </>
  );
};
