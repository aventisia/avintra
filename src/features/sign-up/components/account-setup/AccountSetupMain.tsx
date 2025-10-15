import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer } from "@/components/ui/RightContainer";
import { useCompanyInfoStore } from "@/features/sign-up/stores/company-info-store";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";
import { cn } from "@/react-toolkit/lib/utils";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";

import { useShallow } from "zustand/react/shallow";

import { CompanyInfo } from "./company-info/CompanyInfo";
import { UserType } from "./user-type/UserType";

export const AccountSetupMain = () => {
  // Get store state
  const { stepNo } = useCompanyInfoStore(
    useShallow((state) => ({
      stepNo: state.stepNo,
    })),
  );

  // Validate user session
  const { isPending } = useValidateUserSession(true);

  // Return component
  return (
    <>
      {isPending ? (
        <RedirectPage className="h-auto p-3" />
      ) : (
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

            {/* Step 3 - Verify email address step */}
            {stepNo === 1 && <UserType />}

            {/* Step 4 - Verify email address step */}
            {stepNo === 2 && <CompanyInfo />}

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
      )}
    </>
  );
};
