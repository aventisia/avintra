import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Button,
  SubmitButton,
} from "@/react-toolkit/components/ui";
import {
  ContentHeader,
  ContentFooter,
  ContentContainer,
  ResendCodeButton,
} from "@/components/ui";
import { setUserSessionLocally } from "@/react-toolkit/utils";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useDocumentTitle } from "@/react-toolkit/hooks";
import { ILoginData, ITwoFACodeData } from "../login-types";
import { twoFactorAuthFS } from "../login-fs";
import {
  authenticateUser,
  checkTwoFAVerificationCode,
} from "../apis/login-apis";

interface Step3TwoFAFormProps {
  loginData: ILoginData;
  twoFACodeData: ITwoFACodeData;
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
  fnSetLoginData: (loginData: ILoginData) => void;
  fnSetTwoFACodeData: (twoFACodeData: ITwoFACodeData) => void;
}

const Step3TwoFAForm = ({
  loginData,
  twoFACodeData,
  fnChangeStep,
  fnSetLoginData,
  fnSetTwoFACodeData,
}: Step3TwoFAFormProps) => {
  useDocumentTitle("Two Factor Authentication");
  const navigate = useNavigate();
  const { navDirection } = useAuthStore();

  // Define form
  const form = useForm<z.infer<typeof twoFactorAuthFS>>({
    resolver: zodResolver(twoFactorAuthFS),
    defaultValues: {
      verificationCode: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  // Define mutations
  const verifyTwoFACodeAPI = useMutation({
    mutationFn: checkTwoFAVerificationCode,
    onSuccess: (httpResponse) => {
      // OnSuccess Reset loginData, twoFACodeData & set stepNo to ZERO
      changeStep(0, "forward");

      // Set authenticated user locally
      const userSessionStoreObj = setUserSessionLocally(httpResponse.data);

      // Route as per user type (internal or external)
      navigate(
        "/redirect?msg=Logging in...&url=" +
          (userSessionStoreObj.isAE
            ? import.meta.env.VITE_INTRANET_CENTER_URL
            : import.meta.env.VITE_WORKSPACE_URL),
      );
    },
    onError: () => {
      // Reset loginData, twoFACodeData & move to stepNo-1
      changeStep(1, "backward");
    },
  });

  /* Instead of creating an resend TwoFA code api we are hitting the authenticateUser api again */
  const resendTwoFACodeAPI = useMutation({
    mutationFn: authenticateUser,
    onSuccess: (httpResponse) => {
      //TwoFA is enabled
      if (httpResponse.message.includes("TwoFA is enabled")) {
        // Set verification code id
        fnSetTwoFACodeData({
          email: httpResponse.data.email,
          requestType: httpResponse.data.requestType,
          codeId: httpResponse.data.verificationCodeId,
        });

        // Notify user on success of code creation
        toast.success("Code has been resent to your email");
        return;
      }

      // OnSuccess reset loginData, twoFACodeData & set stepNo to ZERO
      changeStep(0, "forward");

      // Set authenticated user locally
      const userSessionStoreObj = setUserSessionLocally(httpResponse.data);

      // Route as per user type (internal or external)
      navigate(
        "/redirect?msg=Logging in...&url=" +
          (userSessionStoreObj.isAE
            ? import.meta.env.VITE_INTRANET_CENTER_URL
            : import.meta.env.VITE_WORKSPACE_URL),
      );
    },
    onError: () => {
      // Reset loginData, twoFACodeData & move to stepNo-1
      changeStep(1, "backward");
    },
  });

  // Change step or reset data
  const changeStep = (stepNo: number, navDirection: string = "forward") => {
    // StepNo==0 means flow is complete. so no need to transition
    if (stepNo > 0) {
      fnChangeStep(stepNo, navDirection);
    }
    fnSetLoginData({
      tenantId: "none",
      email: "",
      pwd: "",
    });
    fnSetTwoFACodeData({
      email: "",
      requestType: "",
      codeId: "",
    });
  };

  // Define submit handler
  const onSubmit = (filledForm: z.infer<typeof twoFactorAuthFS>) => {
    verifyTwoFACodeAPI.mutate({
      email: twoFACodeData.email,
      requestType: twoFACodeData.requestType,
      verificationCodeId: twoFACodeData.codeId,
      secretCode: filledForm.verificationCode,
    });
  };

  // Define resendCode handler
  const fnResendCode = () => {
    resendTwoFACodeAPI.mutate({
      email: loginData.email,
      pwd: loginData.pwd,
    });
  };

  // Return form
  return (
    <ContentContainer
      className={navDirection == "backward" ? "fadeInLTR" : "fadeInRTL"}
    >
      <ContentHeader
        biggerHeading="Two-factor authentication"
        smallerHeading="Two-factor authentication is enabled for your account. Please
        enter the code sent to your email"
      ></ContentHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-3.5"
        >
          <FormField
            control={form.control}
            name="verificationCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="text"
                    disabled={
                      verifyTwoFACodeAPI.isPending ||
                      resendTwoFACodeAPI.isPending ||
                      isSubmitting
                    }
                    placeholder="Enter 2FA code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Verify code"
            isPending={verifyTwoFACodeAPI.isPending || isSubmitting}
            disabled={
              verifyTwoFACodeAPI.isPending ||
              resendTwoFACodeAPI.isPending ||
              isSubmitting
            }
          />
        </form>
      </Form>
      <ContentFooter className="!mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
        Did not receive the code?
        <ResendCodeButton
          isPending={resendTwoFACodeAPI.isPending}
          disabled={
            verifyTwoFACodeAPI.isPending ||
            resendTwoFACodeAPI.isPending ||
            isSubmitting
          }
          fnResendCode={fnResendCode}
        />
      </ContentFooter>
      <ContentFooter>
        <Button
          className="h-0 p-0 font-normal"
          variant={"link"}
          disabled={
            verifyTwoFACodeAPI.isPending ||
            resendTwoFACodeAPI.isPending ||
            isSubmitting
          }
          onClick={() => changeStep(1, "backward")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="ml-2">Back to log in</span>
        </Button>
      </ContentFooter>
    </ContentContainer>
  );
};

export { Step3TwoFAForm };
