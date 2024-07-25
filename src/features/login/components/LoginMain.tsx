import {
  GetTenantInfo,
  LoginHeader,
  PwdLogin,
  TwoFA,
  useLoginStore,
  useValidateUserSessionForLoginPage,
} from "@/features/login";
import { MinimalFooter } from "@/react-toolkit/components/layout";
import { LeftContainer, RightContainer } from "@/components/ui";
import { useShallow } from "zustand/react/shallow";
import { RedirectPage } from "@/react-toolkit/pages";

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
        <RedirectPage className="h-auto p-0" />
      ) : (
        <>
          <LeftContainer>
            {/* Logog + Help link */}
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

          <RightContainer></RightContainer>
        </>
      )}
    </>
  );
};
