import {
  ICreateAccountData,
  IVerifyEmailAddressData,
  verifyEmailAddressZodSchema,
  createAccount
} from "@/features/create-account";
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
import { createVerificationCode } from "@/react-toolkit/apis";
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

interface Step2VerifyEmailAddressFormProps {
  createAccountData: ICreateAccountData;
  verifyEmailAddressData: IVerifyEmailAddressData;
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
  fnSetCreateAccountData: (loginData: ICreateAccountData) => void;
  fnSetVerifyEmailAddressData: (
    verifyEmailAddressData: IVerifyEmailAddressData,
  ) => void;
}

const Step2VerifyEmailAddressForm = ({
  createAccountData,
  verifyEmailAddressData,
  fnChangeStep,
  fnSetCreateAccountData,
  fnSetVerifyEmailAddressData,
}: Step2VerifyEmailAddressFormProps) => {
  useDocumentTitle("Verify Email Address");
  const navigate = useNavigate();
  const { navDirection } = useAuthStore();

  // Define form
  const form = useForm<z.infer<typeof verifyEmailAddressZodSchema>>({
    resolver: zodResolver(verifyEmailAddressZodSchema),
    defaultValues: { verificationCode: "" },
  });
  const {
    formState: { isSubmitting },
  } = form;

  // Define mutations
  const createAccountAPI = useMutation({
    mutationFn: createAccount,
    onSuccess: (httpResponse) => {
      // OnSuccess Reset createAccountData, verifyEmailAddressData & set stepNo to ZERO
      changeStep(0, true, "forward");

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
      // Reset createAccountData, verifyEmailAddressData & move to stepNo-1
      changeStep(1, false, "backward");
    },
  });

  const resendCodeAPI = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: (httpResponse) => {
      // Set codeId and details
      fnSetVerifyEmailAddressData({
        email: httpResponse.data.email,
        requestType: httpResponse.data.requestType,
        codeId: httpResponse.data.verificationCodeId,
      });

      // Notify user on success of code creation
      toast.success("Code has been resent to your email");
    },
    onError: () => {
      // Reset createAccountData, verifyEmailAddressData & move to stepNo-1
      changeStep(1, false, "backward");
    },
  });

  const changeStep = (
    stepNo: number,
    clearCreateAccountData: boolean = false,
    navDirection: string = "forward",
  ) => {
    // StepNo==0 means flow is complete. so no need to transition
    if (stepNo > 0) {
      fnChangeStep(stepNo, navDirection);
    }

    // If requested to clear
    if (clearCreateAccountData) {
      fnSetCreateAccountData({
        email: "",
        firstName: "",
        lastName: "",
        pwd: "",
      });
    } else {
      fnSetCreateAccountData({
        email: createAccountData.email,
        firstName: createAccountData.firstName,
        lastName: createAccountData.lastName,
        pwd: "",
      });
    }
    fnSetVerifyEmailAddressData({ email: "", requestType: "", codeId: "" });
  };

  // Define submit handler
  const onSubmit = (filledForm: z.infer<typeof verifyEmailAddressZodSchema>) => {
    createAccountAPI.mutate({
      email: createAccountData.email,
      firstName: createAccountData.firstName,
      lastName: createAccountData.lastName,
      pwd: createAccountData.pwd,
      verificationCodeId: verifyEmailAddressData.codeId,
      secretCode: filledForm.verificationCode,
      isSocialSignUp: false,
    });
  };

  // Define resendCode handler
  const fnResendCode = () => {
    resendCodeAPI.mutate({
      email: createAccountData.email,
      requestType: "VerifyEmailAddress",
    });
  };

  // Return form
  return (
    <ContentContainer
      className={navDirection == "backward" ? "fadeInLTR" : "fadeInRTL"}
    >
      <ContentHeader
        biggerHeading="Verify your email"
        smallerHeading="Please enter the verification code sent to your email"
      />
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
                      createAccountAPI.isPending ||
                      resendCodeAPI.isPending ||
                      isSubmitting
                    }
                    placeholder="Enter verification code"
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
            isPending={createAccountAPI.isPending || isSubmitting}
            disabled={
              createAccountAPI.isPending ||
              resendCodeAPI.isPending ||
              isSubmitting
            }
          />
        </form>
      </Form>
      <ContentFooter className="!mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
        Did not receive the code?
        <ResendCodeButton
          isPending={resendCodeAPI.isPending}
          disabled={
            createAccountAPI.isPending ||
            resendCodeAPI.isPending ||
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
            createAccountAPI.isPending ||
            resendCodeAPI.isPending ||
            isSubmitting
          }
          onClick={() => changeStep(1, false, "backward")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="ml-1">Back to create account</span>
        </Button>
      </ContentFooter>
    </ContentContainer>
  );
};

export { Step2VerifyEmailAddressForm };
