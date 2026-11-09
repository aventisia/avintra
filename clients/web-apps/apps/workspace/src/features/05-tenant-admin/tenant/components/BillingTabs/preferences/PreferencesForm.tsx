import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form, InputField, SwitchField } from "@avplatform/ui/form";
import { z } from "zod";

import {
  daysBeforePwdExpiresProps,
  idleSessionTimeoutMinutesProps,
  isIdleSessionTimeoutEnabledProps,
  isPwdEnabledProps,
  isPwdNeverExpiresEnabledProps,
  isTwoFAEnabledProps,
} from "@/features/05-tenant-admin/tenant/constants/tenant-preferences-field-props.ee";
import { preferencesSchema } from "@/features/05-tenant-admin/tenant/constants/tenant-preferences-zod-schema.ee";
import { useDefinePreferencesForm } from "@/features/05-tenant-admin/tenant/hooks/useDefinePreferencesForm.ee";

import TabLoader from "../TabLoader.ee";

const PreferencesForm = () => {
  const {
    form,
    isPwdNeverExpiresEnabled,
    isIdleSessionTimeoutEnabled,
    isDirty,
    isSubmitting,
    isPending,
    mutate,
    isLoading,
  } = useDefinePreferencesForm();

  const onSubmit = (formData: z.infer<typeof preferencesSchema>) => {
    mutate(formData);
  };

  if (isLoading) return <TabLoader />;

  const isSaving = isSubmitting || isPending;

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSaving || isLoading}
      checkDirtyForm={false}
      className="gap-0"
    >
      <div className="overflow-hidden rounded-lg bg-surface ring-1 ring-line">
        <div className="divide-y divide-line">
          <SwitchField {...isTwoFAEnabledProps} showBorder={false} />
          <div className="hidden">
            <SwitchField {...isPwdEnabledProps} showBorder={false} />
          </div>
          <div>
            <SwitchField {...isPwdNeverExpiresEnabledProps} showBorder={false} />
            {!isPwdNeverExpiresEnabled && (
              <div className="max-w-xs px-4 pb-4">
                <InputField {...daysBeforePwdExpiresProps} />
              </div>
            )}
          </div>
          <div className="hidden">
            <SwitchField {...isIdleSessionTimeoutEnabledProps} showBorder={false} />
            {isIdleSessionTimeoutEnabled && (
              <div className="max-w-xs px-4 pb-4">
                <InputField {...idleSessionTimeoutMinutesProps} />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line bg-sunken/60 px-4 py-2.5">
          <p className="text-[12px] text-muted-foreground">
            {isDirty ? "You have unsaved changes." : "Applies to everyone in this tenant."}
          </p>
          <Button type="submit" size="sm" disabled={isSaving || !isDirty} aria-busy={isSaving}>
            {isSaving && <LoadingSpinner className="mr-1 size-4" />}
            {isSaving ? "Saving" : "Save changes"}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default PreferencesForm;
