import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import Lucide from "@/react-toolkit/ui/Lucide";

import { Button } from "@aventisia/ui/buttons";
import { ResendCodeButton } from "@aventisia/ui/buttons";
import { SubmitButton } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { InputField } from "@aventisia/ui/form";
import { InputOtpField } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
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
  const { form, isSubmitting, verifyEmailData, setStepNo } =
    useDefineDeactivationVerifyEmailForm();

  const { deactivationStatusData, isLoading } = useDefineDeactivationForm();

  // Get mutation to deactviate account
  const { deactivateMyAccountMutation, isDeactivationPending } =
    useAccountDeactivateMutation();

  const { resendCodeHandler, isResendCodePending } =
    useResendCodeMutationForDeactivation();

  // Define submit handler
  const onSubmit = (
    formData: z.infer<typeof deactivationVerifyEmailZodSchema>,
  ) => {
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
            primaryText={
              deactivationStatusData?.deactivating
                ? "Cancel Deletion"
                : "Delete"
            }
            variant="destructive"
            className="text-md"
            isPending={isSubmitting || isDeactivationPending || isLoading}
          />
        </div>
      </div>
    </Form>
  );
};
