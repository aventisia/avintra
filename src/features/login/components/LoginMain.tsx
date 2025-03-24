import AccountsAppLogo from "@/components/layout/AccountsAppLogo";
import { LeftContainer } from "@/components/ui/LeftContainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { RightContainer } from "@/components/ui/RightContainer";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { useShallow } from "zustand/react/shallow";
import { useValidateUserSessionForLoginPage } from "../hooks/useValidateUserSessionForLoginPage";
import { useLoginStore } from "../stores/login-store";
import { GetTenantInfo } from "./get-tenant-info/GetTenantInfo";
import { LoginHeader } from "./LoginHeader";
import { PwdLogin } from "./pwd-login/PwdLogin";
import { TwoFA } from "./two-fa/TwoFA";

export const LoginMain = () => {
  // Get store state
  const { stepNo } = useLoginStore(
    useShallow((state) => ({
      stepNo: state.stepNo,
    })),
  );

  // Validate user session
  const { isPending } = useValidateUserSessionForLoginPage();

  // Return component
  return (
    <>
      {isPending ? (
        <RedirectPage appLogo={<AccountsAppLogo />} className="h-auto p-3" />
      ) : (
        <PageContainer>
          <LeftContainer>
            {/* Logo + Help link */}
            <LoginHeader />

            {/* Step 1 - Get tenant info step */}
            {stepNo === 1 && <GetTenantInfo />}

            {/* Step 2 - Pwd login step */}
            {stepNo === 2 && <PwdLogin />}

            {/* Step 3 - 2FA step */}
            {stepNo === 3 && <TwoFA />}

            {/* App footer */}
            <MinimalFooter />
          </LeftContainer>

          <RightContainer
            heading="Your AI-Powered Journey Starts Here"
            subHeading="Enter your gateway to affordable, scalable, and practical automation."
            imgSrc="flowbuilder.svg"
          />
        </PageContainer>
      )}
    </>
  );
};
