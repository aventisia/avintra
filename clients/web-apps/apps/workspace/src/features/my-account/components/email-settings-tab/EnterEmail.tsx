import { VerificationCodeRequestTypesEnum } from "@avplatform/ui/enums";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useId } from "react";
import { createPortal } from "react-dom";
import type { z } from "zod";

import { AvailabilityHint } from "@/components/card-dialog/AvailabilityHint";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import { useCreateCodeMutationForEmailUpdate } from "../../hooks/useCreateCodeMutationForEmailUpdate";
import { useDefineEmailUpdateForm } from "../../hooks/useDefineEmailUpdateForm";
import type { AccountTabProps } from "../../types/account-tab.type";
import type { updateEmailZodSchema } from "../../types/create-account-zod-schema";
import { AccountInfoRow } from "../account-dialog/AccountInfoRow";

export const EnterEmail = ({ footerSlot }: AccountTabProps) => {
  const currentEmail = useUserSessionStore((state) => state.userSession?.email);
  const {
    form,
    isSubmitting,
    setUpdateProfileEmailData,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useDefineEmailUpdateForm();
  const { createCodeMutation, isCodePending } = useCreateCodeMutationForEmailUpdate();
  const fieldId = useId();
  const formId = `${fieldId}-form`;
  const emailId = `${fieldId}-email`;

  const emailError = form.formState.errors.email?.message;
  const isBusy = isSubmitting || isCodePending;

  const handleSubmit = form.handleSubmit((formData: z.infer<typeof updateEmailZodSchema>) => {
    setUpdateProfileEmailData({
      email: formData.email,
    });

    createCodeMutation({
      email: formData.email,
      requestType: VerificationCodeRequestTypesEnum.UpdateEmail,
    });

    setAvailabilityMessage(null);
  });

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <AccountInfoRow label="Current email" value={currentEmail} />
        <fieldset disabled={isBusy}>
          <FormField
            htmlFor={emailId}
            label="New email"
            error={emailError}
            hint={<AvailabilityHint message={availabilityMessage} />}
          >
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? `${emailId}-error` : undefined}
              {...form.register("email", {
                onChange: (event) => handleInputChange(event.target.value),
              })}
              className={cn(getFieldInputClassName(Boolean(emailError)), "h-11")}
            />
          </FormField>
        </fieldset>
      </form>

      {footerSlot &&
        createPortal(
          <>
            <StatusLine tone="idle">We'll email a 6-digit code to confirm it</StatusLine>
            <CardDialogButton
              type="submit"
              form={formId}
              variant="primary"
              disabled={!isAvailable || isCheckPending || isBusy}
              isBusy={isBusy}
            >
              {isBusy ? "Sending" : "Send code"}
            </CardDialogButton>
          </>,
          footerSlot,
        )}
    </>
  );
};
