import { useState } from "react";
import { useAuthStore } from "@/stores";
import { AppLogo, MinimalFooter } from "@/react-toolkit/components/layout";
import { HeaderContainer } from "@/components/layout";
import { LeftContainer, RightContainer } from "@/components/ui";
import { buttonVariants } from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
import {
  ICreateAccountData,
  IVerifyEmailAddressData,
  Step1CreateAccountForm,
  Step2VerifyEmailAddressForm,
} from "@/features/create-account";

const CreateAccountPage = () => {
  const { setNavDirection } = useAuthStore();
  const [stepNo, setStepNo] = useState<number>(1);
  const [createAccountData, setCreateAccountData] =
    useState<ICreateAccountData>({
      email: "",
      firstName: "",
      lastName: "",
      pwd: "",
    });
  const [verifyEmailAddressData, setVerifyEmailAddressData] =
    useState<IVerifyEmailAddressData>({
      email: "",
      requestType: "",
      codeId: "",
    });

  const fnChangeStep = (stepNo: number, navDirection: string = "forward") => {
    setStepNo(stepNo);
    setNavDirection(navDirection);
  };

  const fnSetCreateAccountData = (createAccountData: ICreateAccountData) => {
    setCreateAccountData(createAccountData);
  };

  const fnSetVerifyEmailAddressData = (
    verifyEmailAddressData: IVerifyEmailAddressData,
  ) => {
    setVerifyEmailAddressData(verifyEmailAddressData);
  };

  const switchTheForm = () => {
    switch (stepNo) {
      case 1:
        return (
          <Step1CreateAccountForm
            createAccountData={createAccountData}
            fnChangeStep={fnChangeStep}
            fnSetCreateAccountData={fnSetCreateAccountData}
            fnSetVerifyEmailAddressData={fnSetVerifyEmailAddressData}
          />
        );
      case 2:
        return (
          <Step2VerifyEmailAddressForm
            createAccountData={createAccountData}
            verifyEmailAddressData={verifyEmailAddressData}
            fnChangeStep={fnChangeStep}
            fnSetCreateAccountData={fnSetCreateAccountData}
            fnSetVerifyEmailAddressData={fnSetVerifyEmailAddressData}
          />
        );
    }
  };

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
        {switchTheForm()}
        <MinimalFooter />
      </LeftContainer>
      <RightContainer></RightContainer>
    </>
  );
};

export { CreateAccountPage };
