import { Skeleton } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { useId } from "react";
import { createPortal } from "react-dom";
import type { z } from "zod";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import type { MyAccountDto } from "../../dtos/my-account-profile-dto";
import { useDefineProfileInfoForm } from "../../hooks/useDefineProfileInfoForm";
import { useProfileInfoFormMutation } from "../../hooks/useProfileInfoFormMutation";
import type { AccountTabProps } from "../../types/account-tab.type";
import type { UserProfileZodSchema } from "../../types/profile-zod-schema";

const NAME_MAX_LENGTH = 50;

export const UserForm = ({ footerSlot }: AccountTabProps) => {
  const { form, isDirty, isLoading } = useDefineProfileInfoForm();
  const { mutate, isPending } = useProfileInfoFormMutation();
  const fieldId = useId();
  const formId = `${fieldId}-form`;

  const { errors } = form.formState;
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");

  const handleSubmit = form.handleSubmit((formData: z.infer<typeof UserProfileZodSchema>) =>
    mutate(formData as unknown as MyAccountDto, { onSuccess: () => form.reset(formData) }),
  );

  const nameFields = [
    {
      name: "firstName",
      label: "First name",
      value: firstName,
      autoComplete: "given-name",
      placeholder: "Jane",
    },
    {
      name: "lastName",
      label: "Last name",
      value: lastName,
      autoComplete: "family-name",
      placeholder: "Doe",
    },
  ] as const;

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <fieldset disabled={isPending} className="grid gap-4 sm:grid-cols-2">
          {nameFields.map(({ name, label, value, autoComplete, placeholder }) => {
            const inputId = `${fieldId}-${name}`;
            const error = errors[name]?.message;
            return (
              <FormField
                key={name}
                htmlFor={inputId}
                label={label}
                length={value.length}
                maxLength={NAME_MAX_LENGTH}
                error={error}
              >
                {isLoading ? (
                  <Skeleton className="h-11" />
                ) : (
                  <input
                    id={inputId}
                    autoComplete={autoComplete}
                    maxLength={NAME_MAX_LENGTH}
                    placeholder={placeholder}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...form.register(name)}
                    className={cn(getFieldInputClassName(Boolean(error)), "h-11")}
                  />
                )}
              </FormField>
            );
          })}
        </fieldset>
      </form>

      {footerSlot &&
        createPortal(
          <>
            <StatusLine tone={isDirty ? "pending" : "idle"}>
              {isDirty ? "Unsaved changes" : "Shown to people in your workspace"}
            </StatusLine>
            <div className="flex shrink-0 items-center gap-2">
              {isDirty && (
                <CardDialogButton onClick={() => form.reset()} disabled={isPending}>
                  Discard
                </CardDialogButton>
              )}
              <CardDialogButton
                type="submit"
                form={formId}
                variant="primary"
                disabled={!isDirty || isLoading || isPending}
                isBusy={isPending}
              >
                {isPending ? "Saving" : "Save changes"}
              </CardDialogButton>
            </div>
          </>,
          footerSlot,
        )}
    </>
  );
};
