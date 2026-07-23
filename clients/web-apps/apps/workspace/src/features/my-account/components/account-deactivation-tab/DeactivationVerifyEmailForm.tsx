import { Button, ResendCodeButton, SubmitButton } from "@avplatform/ui/buttons";
import Lucide from "@avplatform/ui/components/Lucide";
import { Form, InputField, InputOtpField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import type { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { verificationCodeProps } from "../../constants/constants";
import type { deactivationVerifyEmailZodSchema } from "../../constants/deactivation-verify-email-zod-schema";
import { useAccountDeactivateMutation } from "../../hooks/useAccountDeactivateMutation";
import { useDefineDeactivationForm } from "../../hooks/useDefineDeactivationForm";
import { useDefineDeactivationVerifyEmailForm } from "../../hooks/useDefineDeactivationVerifyEmailForm";
import { useResendCodeMutationForDeactivation } from "../../hooks/useResendCodeMutationForDeactivation";
import { InputDivElement } from "../InputDivElement";

export const DeactivationVerifyEmailForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Define form
  const { form, isSubmitting, verifyEmailData, setStepNo } = useDefineDeactivationVerifyEmailForm();

  const { deactivationStatusData, isLoading } = useDefineDeactivationForm();

  // Get mutation to deactviate account
  const { deactivateMyAccountMutation, isDeactivationPending } = useAccountDeactivateMutation();

  const { resendCodeHandler, isResendCodePending } = useResendCodeMutationForDeactivation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof deactivationVerifyEmailZodSchema>) => {
    // store data is null
    if (!verifyEmailData || !deactivationStatusData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    // deactviate account
    deactivateMyAccountMutation({
      deactivate: !deactivationStatusData?.deactivating,
      password: formData.password,
      verificationCodeId: verifyEmailData.codeId,
      secretCode: formData.verificationCode,
    });
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isDeactivationPending || isLoading}
      checkDirtyForm={false}
    >
      <div className="box flex flex-col p-5">
        {/* <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-sm font-medium">
          Email Settings
        </div> */}
        <div>
          <InputDivElement
            headingForInput="Verify Your Email"
            isRequired={true}
            messageForInput={`Please enter the verification code sent to your ${userSession!.email} email.`}
          >
            <InputOtpField containerClassName="!justify-center" {...verificationCodeProps} />
          </InputDivElement>
          <InputDivElement
            headingForInput="Enter your password"
            isRequired={true}
            messageForInput="Please enter your password to continue."
          >
            <InputField
              name="password"
              type="password"
              className="border-slate-300/60 shadow-sm"
              size={80}
            />
          </InputDivElement>
        </div>
        <div className="flex flex-wrap pt-5 md:justify-end">
          <Button
            className="me-auto text-sm font-normal"
            variant="link"
            type="reset"
            onClick={() => setStepNo(1)}
          >
            <Lucide icon="ArrowLeft" className="h-6 w-6" />
            <span className="ml-1">Cancel</span>
          </Button>
          <div className="me-2 flex flex-row flex-wrap items-center gap-2 text-sm">
            <p>Did not receive the code?</p>
            <ResendCodeButton
              isPending={isResendCodePending}
              disabled={isResendCodePending}
              resendCodeFn={resendCodeHandler}
            />
          </div>
          <SubmitButton
            primaryText={
              deactivationStatusData?.deactivating ? "Cancel Deactivation" : "Deactivate"
            }
            variant="destructive"
            className="text-sm"
            isPending={isSubmitting || isDeactivationPending || isLoading}
          />
        </div>
      </div>
    </Form>
  );
};
