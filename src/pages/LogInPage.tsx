import { useState } from "react";
import { AppLogo, MinimalFooter } from "@/react-toolkit/components/layout";
import { HeaderContainer } from "@/components/layout";
import { LeftContainer, RightContainer } from "@/components/ui";
import { useAuthStore } from "@/stores";
import {
  ILoginData,
  ITwoFACodeData,
  Step1GetTenantInfoForm,
  Step2PwdLoginForm,
  Step3TwoFAForm,
} from "@/features/login";
import { RedirectPage } from "@/react-toolkit/pages";
import { cn } from "@/react-toolkit/lib";
import { buttonVariants } from "@/react-toolkit/components/ui";
import { useValidateUserSessionForLoginPage } from "@/features/login/hooks/useValidateUserSessionForLoginPage";

export const LogInPage = () => {
  // validate user session
  const { isPending } = useValidateUserSessionForLoginPage();

  // Required state
  const { setNavDirection } = useAuthStore();
  const [stepNo, setStepNo] = useState<number>(1);
  const [loginData, setLoginData] = useState<ILoginData>({
    tenantId: "none",
    email: "",
    pwd: "",
  });
  const [twoFACodeData, setTwoFACodeData] = useState<ITwoFACodeData>({
    email: "",
    requestType: "",
    codeId: "",
  });

  const fnChangeStep = (stepNo: number, navDirection: string = "forward") => {
    setStepNo(stepNo);
    setNavDirection(navDirection);
  };

  const fnSetLoginData = (loginData: ILoginData) => {
    setLoginData(loginData);
  };

  const fnSetTwoFACodeData = (twoFACodeData: ITwoFACodeData) => {
    setTwoFACodeData(twoFACodeData);
  };

  const switchTheForm = () => {
    switch (stepNo) {
      case 1:
        return (
          <Step1GetTenantInfoForm
            fnChangeStep={fnChangeStep}
            fnSetLoginData={fnSetLoginData}
          />
        );
      case 2:
        return (
          <Step2PwdLoginForm
            loginData={loginData}
            fnChangeStep={fnChangeStep}
            fnSetLoginData={fnSetLoginData}
            fnSetTwoFACodeData={fnSetTwoFACodeData}
          />
        );
      case 3:
        return (
          <Step3TwoFAForm
            loginData={loginData}
            twoFACodeData={twoFACodeData}
            fnChangeStep={fnChangeStep}
            fnSetLoginData={fnSetLoginData}
            fnSetTwoFACodeData={fnSetTwoFACodeData}
          />
        );
    }
  };

  return (
    <>
      {isPending ? (
        <RedirectPage className="h-auto p-0" />
      ) : (
        <>
          <LeftContainer>
            <HeaderContainer>
              <AppLogo />
              <a
                href="/help?id=login"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "text-right",
                )}
              >
                Help?
              </a>
            </HeaderContainer>
            {switchTheForm()}
            <MinimalFooter />
          </LeftContainer>
          <RightContainer></RightContainer>
        </>
      )}
    </>
  );
};
