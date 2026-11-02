import { ResendCodeButton } from "@avplatform/ui/buttons";
import { InputOtpField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import { useId } from "react";
import { createPortal } from "react-dom";
import { FormProvider } from "react-hook-form";
import type { z } from "zod";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import { verificationCodeProps } from "../../constants/constants";
import type { verifyEmailZodSchema } from "../../constants/verify-email-zod-schema";
import { useDefineVerifyEmailForm } from "../../hooks/useDefineVerifyEmailForm";
import { useProfileEmailMutation } from "../../hooks/useProfileEmailMutation";
import { useResendCodeMutationForEmailUpdate } from "../../hooks/useResendCodeMutationForEmailUpdate";
import type { AccountTabProps } from "../../types/account-tab.type";

export const VerifyEmail = ({ footerSlot }: AccountTabProps) => {
  const { form, isSubmitting, updateProfileEmailData, verifyEmailData, setStepNo } =
    useDefineVerifyEmailForm();
  const { updateProfileEmailMutation, isUpdatePending } = useProfileEmailMutation();
  const { resendCodeHandler, isResendCodePending } = useResendCodeMutationForEmailUpdate();
  const formId = `${useId()}-form`;

  const code = form.watch("verificationCode");
  const isBusy = isSubmitting || isUpdatePending;

  const handleSubmit = form.handleSubmit((formData: z.infer<typeof verifyEmailZodSchema>) => {
    if (!updateProfileEmailData || !verifyEmailData) {
      toast.error("Something went wrong. Please try again.");
      setStepNo(1);
      return;
    }

    updateProfileEmailMutation({
      email: updateProfileEmailData.email,
      verificationCodeId: verifyEmailData.codeId,
      secretCode: formData.verificationCode,
    });
  });

  return (
    <>
      <FormProvider {...form}>
        <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
          <p className="text-body-sm text-ink-2">
            Enter the 6-digit code we sent to{" "}
            <span className="font-semibold text-ink">{updateProfileEmailData?.email}</span>
          </p>
          <div className="max-w-xs">
            <InputOtpField {...verificationCodeProps} autoFocus disabled={isBusy} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
            Didn't get it?
            <ResendCodeButton
              isPending={isResendCodePending}
              disabled={isResendCodePending || isBusy}
              resendCodeFn={resendCodeHandler}
            />
          </div>
        </form>
      </FormProvider>

      {footerSlot &&
        createPortal(
          <>
            <StatusLine tone="pending">Check your inbox</StatusLine>
            <div className="flex shrink-0 items-center gap-2">
              <CardDialogButton onClick={() => setStepNo(1)} disabled={isBusy}>
                Change email
              </CardDialogButton>
              <CardDialogButton
                type="submit"
                form={formId}
                variant="primary"
                disabled={code.length < verificationCodeProps.maxLength || isBusy}
                isBusy={isBusy}
              >
                {isBusy ? "Verifying" : "Verify email"}
              </CardDialogButton>
            </div>
          </>,
          footerSlot,
        )}
    </>
  );
};
