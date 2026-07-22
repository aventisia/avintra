import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer } from "@/components/ui/RightContainer";
import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";

import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { useChoosePlanStore } from "../stores/choose-plan-store";
import { BillingAddress } from "./billing-address/BillingAddress";
import { ChoosePlan } from "./choose-plan/ChoosePlan";
import Summary from "./summary/Summary";

export const ChoosePlanMain = () => {
  // Get store state
  const { stepNo } = useChoosePlanStore(
    useShallow((state) => ({
      stepNo: state.stepNo,
    })),
  );

  // Return component
  return (
    <>
      <PageContainer>
        <LeftContainer className="lg:w-[60%] ">
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
          {stepNo === 1 && <ChoosePlan />}

          {/* Step 4 - Verify email address step */}
          {stepNo === 2 && <BillingAddress />}
          {stepNo === 3 && <Summary />}

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
