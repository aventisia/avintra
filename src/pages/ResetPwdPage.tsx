import { useState } from "react";
import { AppLogo, MinimalFooter } from "@/react-toolkit/components/layout";
import { HeaderContainer } from "@/components/layout";
import { LeftContainer, RightContainer } from "@/components/ui";
import { useAuthStore } from "@/stores";
import { cn } from "@/react-toolkit/lib";
import { buttonVariants } from "@/react-toolkit/components/ui";
import {
  IVerifyCodeData,
  Step1ProvideEmailToResetPwdForm,
  Step2VerifyCodeForm,
  Step3ResetPwdForm,
} from "@/features/reset-pwd";

const ResetPwdPage = () => {
  const { setNavDirection } = useAuthStore();
  const [stepNo, setStepNo] = useState<number>(1);
  const [verifyCodeData, setVerifyCodeData] = useState<IVerifyCodeData>({
    email: "",
    requestType: "",
    codeId: "",
  });

  const fnChangeStep = (stepNo: number, navDirection: string = "forward") => {
    setStepNo(stepNo);
    setNavDirection(navDirection);
  };

  const fnSetVerifyCodeData = (twoFACodeData: IVerifyCodeData) => {
    setVerifyCodeData(twoFACodeData);
  };

  const switchTheForm = () => {
    switch (stepNo) {
      case 1:
        return (
          <Step1ProvideEmailToResetPwdForm
            fnChangeStep={fnChangeStep}
            fnSetVerifyCodeData={fnSetVerifyCodeData}
          />
        );
      case 2:
        return (
          <Step2VerifyCodeForm
            verifyCodeData={verifyCodeData}
            fnChangeStep={fnChangeStep}
            fnSetVerifyCodeData={fnSetVerifyCodeData}
          />
        );
      case 3:
        return <Step3ResetPwdForm fnChangeStep={fnChangeStep} />;
    }
  };

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
        {switchTheForm()}
        <MinimalFooter />
      </LeftContainer>
      <RightContainer></RightContainer>
    </>
  );
};

export { ResetPwdPage };
