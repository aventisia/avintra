import { Switch } from "@avplatform/ui";
import { getFieldInputClassName } from "@avplatform/ui/lib";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { z } from "zod";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import { getMyProfileInfo } from "../../apis/my-account-apis";
import { useDefineProfilePasswordForm } from "../../hooks/useDefineProfilePasswordForm";
import { useProfilePasswordFormMutation } from "../../hooks/useProfilePasswordFormMutation";
import type { AccountTabProps } from "../../types/account-tab.type";
import type { PwdZodSchema } from "../../types/pwd-zod-schema";

type PasswordField = {
  name: "oldPwd" | "newPwd" | "confirmNewPwd";
  label: string;
  autoComplete: string;
  hint?: string;
  className?: string;
};

const PASSWORD_FIELDS: PasswordField[] = [
  {
    name: "oldPwd",
    label: "Current password",
    autoComplete: "current-password",
    className: "sm:col-span-2",
  },
  {
    name: "newPwd",
    label: "New password",
    autoComplete: "new-password",
    hint: "8 to 16 characters",
  },
  { name: "confirmNewPwd", label: "Confirm new password", autoComplete: "new-password" },
];

export const SecurityTab = ({ footerSlot }: AccountTabProps) => {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    getMyProfileInfo()
      .then(({ data }) =>
        setHasPassword(data && typeof data.hasPassword === "boolean" ? data.hasPassword : true),
      )
      .catch(() => setHasPassword(true));
  }, []);

  if (hasPassword === null) return null;

  return (
    <PasswordForm
      key={hasPassword ? "change" : "set"}
      hasPassword={hasPassword}
      footerSlot={footerSlot}
      onPasswordSet={() => setHasPassword(true)}
    />
  );
};

const PasswordForm = ({
  hasPassword,
  footerSlot,
  onPasswordSet,
}: AccountTabProps & { hasPassword: boolean; onPasswordSet: () => void }) => {
  const { form, isDirty } = useDefineProfilePasswordForm(hasPassword);
  const { mutate, isPending } = useProfilePasswordFormMutation();
  const fieldId = useId();
  const formId = `${fieldId}-form`;
  const signOutOthersId = `${fieldId}-sign-out-others`;

  const { errors } = form.formState;
  const logoffFromOtherSessions = form.watch("logoffFromOtherSessions");

  const fields = hasPassword
    ? PASSWORD_FIELDS
    : PASSWORD_FIELDS.filter((field) => field.name !== "oldPwd");

  const labelFor = (field: PasswordField) =>
    !hasPassword && field.name === "newPwd" ? "Password" : field.label;

  const handleSubmit = form.handleSubmit((formData: z.infer<typeof PwdZodSchema>) =>
    mutate(
      {
        oldPwd: formData.oldPwd ?? "",
        newPwd: formData.newPwd,
        logoffFromOtherSessions: formData.logoffFromOtherSessions,
      },
      {
        onSuccess: () => {
          form.reset();
          if (!hasPassword) onPasswordSet();
        },
      },
    ),
  );

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <fieldset disabled={isPending} className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const inputId = `${fieldId}-${field.name}`;
            const error = errors[field.name]?.message;
            return (
              <div key={field.name} className={field.className}>
                <FormField
                  htmlFor={inputId}
                  label={labelFor(field)}
                  error={error}
                  hint={
                    field.hint && (
                      <span className="block pt-1.5 text-[12px] text-muted-foreground">
                        {field.hint}
                      </span>
                    )
                  }
                >
                  <input
                    id={inputId}
                    type="password"
                    autoComplete={field.autoComplete}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...form.register(field.name)}
                    className={getFieldInputClassName(Boolean(error))}
                  />
                </FormField>
              </div>
            );
          })}

          <div className="flex items-center justify-between gap-4 rounded-md bg-sunken/80 px-3.5 py-3 ring-1 ring-line sm:col-span-2">
            <label htmlFor={signOutOthersId} className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink">
                Sign out other devices
              </span>
              <span className="block text-[12px] text-muted-foreground">
                Everywhere else will need the new password
              </span>
            </label>
            <Switch
              id={signOutOthersId}
              size="sm"
              checked={logoffFromOtherSessions}
              onCheckedChange={(checked) =>
                form.setValue("logoffFromOtherSessions", checked, { shouldDirty: true })
              }
            />
          </div>
        </fieldset>
      </form>

      {footerSlot &&
        createPortal(
          <>
            <StatusLine tone={isDirty ? "pending" : "idle"}>
              {isDirty ? "Unsaved changes" : "Choose one you don't use elsewhere"}
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
                disabled={!isDirty || isPending}
                isBusy={isPending}
              >
                {isPending
                  ? hasPassword
                    ? "Updating"
                    : "Setting"
                  : hasPassword
                    ? "Update password"
                    : "Set password"}
              </CardDialogButton>
            </div>
          </>,
          footerSlot,
        )}
    </>
  );
};
