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
  createVerificationCode,
  checkVerificationCode,
} from "@/react-toolkit/apis";
import {
  ContentHeader,
  ContentFooter,
  ContentContainer,
  ResendCodeButton,
} from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useDocumentTitle } from "@/react-toolkit/hooks";
import { IVerifyCodeData } from "../reset-pwd-types";
import { verifyCodeFS } from "../reset-pwd-fs";

interface Step2VerifyCodeFormProps {
  verifyCodeData: IVerifyCodeData;
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
  fnSetVerifyCodeData: (verifyCodeData: IVerifyCodeData) => void;
}

const Step2VerifyCodeForm = ({
  verifyCodeData,
  fnChangeStep,
  fnSetVerifyCodeData,
}: Step2VerifyCodeFormProps) => {
  useDocumentTitle("Verify Code");
  const navigate = useNavigate();
  const { navDirection } = useAuthStore();

  // Define form
  const form = useForm<z.infer<typeof verifyCodeFS>>({
    resolver: zodResolver(verifyCodeFS),
    defaultValues: {
      verificationCode: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  // Define mutations
  const verifyCodeAPI = useMutation({
    mutationFn: checkVerificationCode,
    onSuccess: () => {
      // OnSuccess reset verifyCodeData & set stepNo to 3
      changeStep(3, "forward");
    },
    onError: () => {
      // Reset verifyCodeData & set stepNo to 1
      changeStep(1, "backward");
    },
  });

  const resendCodeAPI = useMutation({
    mutationFn: createVerificationCode,
    onSuccess: (httpResponse) => {
      // Set codeId and details
      fnSetVerifyCodeData({
        email: httpResponse.data.email,
        requestType: httpResponse.data.requestType,
        codeId: httpResponse.data.verificationCodeId,
      });

      // Notify user on success of code creation
      toast.success("Code has been resent to your email");
    },
    onError: () => {
      // Reset verifyCodeData & set stepNo to 1
      changeStep(1, "backward");
    },
  });

  // Change step or reset data
  const changeStep = (stepNo: number, navDirection: string = "forward") => {
    // StepNo==0 means flow is complete. so no need to transition
    if (stepNo > 0) {
      fnChangeStep(stepNo, navDirection);
    }

    fnSetVerifyCodeData({
      email: "",
      requestType: "",
      codeId: "",
    });
  };

  // Define submit handler
  const onSubmit = (filledForm: z.infer<typeof verifyCodeFS>) => {
    verifyCodeAPI.mutate({
      email: verifyCodeData.email,
      requestType: verifyCodeData.requestType,
      verificationCodeId: verifyCodeData.codeId,
      secretCode: filledForm.verificationCode,
    });
  };

  // Define resendCode handler
  const fnResendCode = () => {
    resendCodeAPI.mutate({
      email: verifyCodeData.email,
      requestType: "ResetPwd",
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
                      verifyCodeAPI.isPending ||
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
            isPending={verifyCodeAPI.isPending || isSubmitting}
            disabled={
              verifyCodeAPI.isPending || resendCodeAPI.isPending || isSubmitting
            }
          />
        </form>
      </Form>
      <ContentFooter className="!mb-3 flex-col gap-4 mlg:!mb-0 mlg:flex-row mlg:gap-1">
        Did not receive the code?
        <ResendCodeButton
          isPending={resendCodeAPI.isPending}
          disabled={
            verifyCodeAPI.isPending || resendCodeAPI.isPending || isSubmitting
          }
          fnResendCode={fnResendCode}
        />
      </ContentFooter>
      <ContentFooter className="!mt-6">
        <Button
          className="h-0 p-0 font-normal"
          variant={"link"}
          disabled={
            verifyCodeAPI.isPending || resendCodeAPI.isPending || isSubmitting
          }
          onClick={() => navigate("/login")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="ml-2">Back to log in</span>
        </Button>
      </ContentFooter>
    </ContentContainer>
  );
};

export { Step2VerifyCodeForm };
