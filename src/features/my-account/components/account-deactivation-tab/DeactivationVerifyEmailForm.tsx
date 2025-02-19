import { Form } from "@/react-toolkit/ui/form/Form";
import { InputDivElement } from "../InputDivElement";
import type { z } from "zod";
import { InputOtpField } from "@/react-toolkit/ui/form/fields/InputOtpField";
import { SubmitButton } from "@/react-toolkit/ui/buttons/SubmitButton";
import { toast } from "sonner";
import Lucide from "@/react-toolkit/ui/Lucide";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ResendCodeButton } from "@/components/ui/ResendCodeButton";
import { useResendCodeMutation } from "../../hooks/useResendCodeMutation";
import { verificationCodeProps } from "../../constants/constants";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { useDefineDeactivationVerifyEmailForm } from "../../hooks/useDefineDeactivationVerifyEmailForm";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { useShallow } from "zustand/react/shallow";
import { useAccountDeactivateMutation } from "../../hooks/useAccountDeactivateMutation";
import type { deactivationVerifyEmailZodSchema } from "../../constants/deactivation-verify-email-zod-schema";

export const DeactivationVerifyEmailForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Define form
  const { form, isSubmitting, verifyEmailData, setStepNo } =
    useDefineDeactivationVerifyEmailForm();

  // Get mutation to deactviate account
  const { deactivateMyAccountMutation, isDeactivationPending } =
    useAccountDeactivateMutation();

  const { resendCodeHandler, isResendCodePending } = useResendCodeMutation();

  // Define submit handler
  const onSubmit = (
    formData: z.infer<typeof deactivationVerifyEmailZodSchema>,
  ) => {
    // store data is null
    if (!verifyEmailData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    // deactviate account
    deactivateMyAccountMutation({
      password: formData.password,
      verificationCodeId: verifyEmailData.codeId,
      secretCode: formData.verificationCode,
    });
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isDeactivationPending}
      checkDirtyForm={false}
    >
      <div className="box flex flex-col p-5">
        <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-[0.94rem] font-medium">
          Email Settings
        </div>
        <div>
          <InputDivElement
            headingForInput="Verify Your Email"
            isRequired={true}
            messageForInput={`Please enter the verification code sent to your ${userSession!.email} email.`}
          >
            <InputOtpField
              containerClassName="!justify-center"
              {...verificationCodeProps}
            />
          </InputDivElement>
          <InputDivElement
            headingForInput="Enter your password"
            isRequired={true}
            messageForInput="Please enter your password to continue."
          >
            <InputField
              name="password"
              type="password"
              placeholder="p*******d"
              className="border-slate-300/60 shadow-sm"
              size={80}
            />
          </InputDivElement>
        </div>
        <div className="mt-6 flex flex-wrap border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
          <Button
            className="text-md me-auto font-normal"
            variant="link"
            type="reset"
            onClick={() => setStepNo(1)}
          >
            <Lucide icon="ArrowLeft" className="h-6 w-6" />
            <span className="ml-1">Cancel</span>
          </Button>
          <div className="text-md me-2 flex flex-row flex-wrap items-center gap-2">
            <p>Did not receive the code?</p>
            <ResendCodeButton
              isPending={isResendCodePending}
              disabled={isResendCodePending}
              resendCodeFn={resendCodeHandler}
            />
          </div>
          <SubmitButton
            primaryText="Delete"
            variant="destructive"
            className="text-md"
            isPending={isSubmitting || isDeactivationPending}
          />
        </div>
      </div>
    </Form>
  );
};
