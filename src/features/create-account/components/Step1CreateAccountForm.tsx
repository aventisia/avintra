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
  Checkbox,
  buttonVariants,
  SubmitButton,
  SeparatorWithText,
} from "@/react-toolkit/components/ui";
import {
  SocialButtons,
  ContentHeader,
  ContentFooter,
  ContentContainer,
} from "@/components/ui";
import { useAuthStore } from "@/stores";
import { useDocumentTitle } from "@/react-toolkit/hooks";
import { createVerificationCode, doesEmailExist } from "@/react-toolkit/apis";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { emailRegex } from "@/react-toolkit/components/form";
import { cn } from "@/react-toolkit/lib";
// local
import {
  ICreateAccountData,
  IVerifyEmailAddressData,
} from "../create-account-types";
import { createAccountFS } from "../create-account-fs";

interface Step1CreateAccountFormProps {
  createAccountData: ICreateAccountData;
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
  fnSetCreateAccountData: (loginData: ICreateAccountData) => void;
  fnSetVerifyEmailAddressData: (
    verifyEmailAddressData: IVerifyEmailAddressData,
  ) => void;
}

const Step1CreateAccountForm = ({
  createAccountData,
  fnChangeStep,
  fnSetCreateAccountData,
  fnSetVerifyEmailAddressData,
}: Step1CreateAccountFormProps) => {
  useDocumentTitle("Create Account");
  const { navDirection } = useAuthStore();
  const [emailCheckPending, setEmailCheckPending] = useState(false);
  const [accountFound, setAccountFound] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);

  // Define form
  const form = useForm<z.infer<typeof createAccountFS>>({
    resolver: zodResolver(createAccountFS),
    defaultValues: {
      firstName: createAccountData.firstName,
      lastName: createAccountData.lastName,
      email: createAccountData.email,
      pwd: "",
      confirmPwd: "",
      termsAgreement: false,
    },
  });
  const {
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = form;

  // Define mutation to create verification code
  const { mutate, isPending } = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: (httpResponse) => {
      // Set codeId and details
      fnSetVerifyEmailAddressData({
        email: httpResponse.data.email,
        requestType: httpResponse.data.requestType,
        codeId: httpResponse.data.verificationCodeId,
      });

      // Go to next stepNo-2 - verify email address
      changeStep(2, false, "forward");
    },
    onError: () => {
      // Reset createAccountData & move to stepNo-1
      changeStep(1, true, "backward");
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
    if (clearCreateAccountData) {
      fnSetCreateAccountData({
        firstName: "",
        lastName: "",
        email: "",
        pwd: "",
      });
    }
  };

  // Check email existence
  const checkEmailExistence = async (emailAddress: string) => {
    setEmailCheckPending(true);
    setAccountFound(false);
    setAccountNotFound(false);
    const emailExists = await doesEmailExist({ email: emailAddress });
    if (emailExists) {
      setEmailCheckPending(false);
      if (emailExists.data.result) {
        setAccountFound(true);
        setError("email", {
          type: "manual",
          message:
            "This email address is already in use. Please try a different one",
        });
      } else {
        setAccountNotFound(true);
        clearErrors("email");
      }
      return emailExists.data.result;
    }
  };

  const handleEmailChange = () => {
    setEmailCheckPending(false);
    setAccountFound(false);
    setAccountNotFound(false);
    clearErrors("email");
  };

  const handleEmailBlur = async (emailAddress: string) => {
    // Return if email is invalid
    if (!emailRegex.test(emailAddress)) return;

    // Check email address
    await checkEmailExistence(emailAddress);
  };

  // Define submit handler
  const onSubmit = async (filledForm: z.infer<typeof createAccountFS>) => {
    // Have ot set or clear error manually for boolean datatype since zod does not do it automatically
    if (!filledForm.termsAgreement) {
      form.setError("termsAgreement", {
        type: "manual",
        message: "You must accept Terms and Conditions",
      });
      return;
    } else {
      form.clearErrors("termsAgreement");
    }

    // Check email address
    if (accountNotFound || !(await checkEmailExistence(filledForm.email))) {
      // Set CreateAccountData to use in stepNo-2
      fnSetCreateAccountData({
        firstName: filledForm.firstName,
        lastName: filledForm.lastName,
        email: filledForm.email,
        pwd: filledForm.pwd,
      });
      mutate({
        email: filledForm.email,
        requestType: "VerifyEmailAddress",
      });
    }
  };

  // Return form
  return (
    <ContentContainer
      className={navDirection == "backward" ? "fadeInLTR" : "fadeInRTL"}
    >
      <ContentHeader
        biggerHeading="Create account"
        smallerHeading="Select method to sign up:"
      ></ContentHeader>
      <SocialButtons isPending={isPending || isSubmitting} />
      <SeparatorWithText overlayText="or" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-3.5"
        >
          <div className="flex flex-col space-x-0 space-y-3.5 xs:flex-row xs:space-x-3.5 xs:space-y-0">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="w-full xs:w-[50%]">
                  <FormControl>
                    <Input
                      type="text"
                      disabled={isPending || isSubmitting}
                      placeholder="Firstname"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="w-full xs:w-[50%]">
                  <FormControl>
                    <Input
                      type="text"
                      disabled={isPending || isSubmitting}
                      placeholder="Lastname"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      type="email"
                      disabled={isPending || isSubmitting}
                      onBlurCapture={(e) =>
                        handleEmailBlur(e.currentTarget.value)
                      }
                      onChangeCapture={() => handleEmailChange()}
                      placeholder="Email"
                      {...field}
                    />
                    <div className="absolute right-2 rounded-full">
                      {emailCheckPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {accountFound && (
                        <XCircleIcon className="h-5 w-5 text-destructive" />
                      )}
                      {accountNotFound && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col space-x-0 space-y-3.5 xs:flex-row xs:space-x-3.5 xs:space-y-0">
            <FormField
              control={form.control}
              name="pwd"
              render={({ field }) => (
                <FormItem className="w-full xs:w-[50%]">
                  <FormControl>
                    <Input
                      type="password"
                      disabled={isPending || isSubmitting}
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPwd"
              render={({ field }) => (
                <FormItem className="w-full xs:w-[50%]">
                  <FormControl>
                    <Input
                      disabled={isPending || isSubmitting}
                      type="password"
                      placeholder="Confirm password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="termsAgreement"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <div className="ml-0.5 flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      disabled={isPending || isSubmitting}
                      className="mb-[0.1rem]"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-sm font-normal">
                    I agree to the{" "}
                    <a
                      href="/help?id=create-account"
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        isPending || isSubmitting
                          ? "pointer-events-none cursor-not-allowed"
                          : "pointer-events-auto cursor-pointer hover:underline",
                      )}
                    >
                      Terms & Conditions
                    </a>
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Create"
            isPending={(isPending || isSubmitting) && !emailCheckPending}
            disabled={isPending || isSubmitting || emailCheckPending}
          />
          <ContentFooter>
            <span className="text-sm text-foreground">Have an account?</span>
            <a href={`${import.meta.env.BASE_URL}login`} className={buttonVariants({ variant: "link" })}>
              Log in
            </a>
          </ContentFooter>
        </form>
      </Form>
    </ContentContainer>
  );
};

export { Step1CreateAccountForm };
