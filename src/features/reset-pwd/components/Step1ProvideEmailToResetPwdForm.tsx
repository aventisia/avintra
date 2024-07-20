import { IVerifyCodeData, provideEmailZodSchema } from "@/features/reset-pwd";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores";
import { useDocumentTitle } from "@/react-toolkit/hooks";

interface Step1ProvideEmailToResetPwdFormProps {
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
  fnSetVerifyCodeData: (verifyCodeData: IVerifyCodeData) => void;
}

const Step1ProvideEmailToResetPwdForm = ({
  fnChangeStep,
  fnSetVerifyCodeData,
}: Step1ProvideEmailToResetPwdFormProps) => {
  useDocumentTitle("Reset Password");
  const navigate = useNavigate();
  const { navDirection } = useAuthStore();
  const userName = localStorage.getItem("userName");

  // Define form
  const form = useForm<z.infer<typeof provideEmailZodSchema>>({
    resolver: zodResolver(provideEmailZodSchema),
    defaultValues: {
      email: userName ? userName : "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  // Define mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: (httpResponse) => {
      // Set codeId and details
      fnSetVerifyCodeData({
        email: httpResponse.data.email,
        requestType: httpResponse.data.requestType,
        codeId: httpResponse.data.verificationCodeId,
      });

      // Go to next stepNo-2 - verify code
      changeStep(2, false, "forward");
    },
    onError: () => {
      // Reset verifyCodeData & move to stepNo-1
      changeStep(1, true, "backward");
    },
  });

  const changeStep = (
    stepNo: number,
    clearVerifyCodeData: boolean = false,
    navDirection: string = "forward",
  ) => {
    // StepNo==0 means flow is complete. so no need to transition
    if (stepNo > 0) {
      fnChangeStep(stepNo, navDirection);
    }
    if (clearVerifyCodeData) {
      fnSetVerifyCodeData({
        email: "",
        requestType: "",
        codeId: "",
      });
    }
  };

  // Define submit handler.
  const onSubmit = (filledForm: z.infer<typeof provideEmailZodSchema>) => {
    mutate({
      email: filledForm.email,
      requestType: "ResetPwd",
    });
  };

  // Return form
  return (
    <ContentContainer
      className={navDirection == "backward" ? "fadeInLTR" : "fadeInRTL"}
    >
      <ContentHeader
        biggerHeading="Want to reset your password?"
        smallerHeading="No worries, we'll send you reset instructions"
      ></ContentHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-3.5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    disabled={isPending || isSubmitting}
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Continue"
            isPending={isPending || isSubmitting}
          />
        </form>
      </Form>
      <ContentFooter>
        <Button
          className="h-0 p-0 font-normal"
          variant={"link"}
          disabled={isPending || isSubmitting}
          onClick={() => navigate("/login")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="ml-2">Back to log in</span>
        </Button>
      </ContentFooter>
    </ContentContainer>
  );
};

export { Step1ProvideEmailToResetPwdForm };
