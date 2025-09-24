import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form, InputField, SwitchField } from "@aventisia/ui/form";
import { z } from "zod";

import {
  daysBeforePwdExpiresProps,
  idleSessionTimeoutMinutesProps,
  isIdleSessionTimeoutEnabledProps,
  isPwdEnabledProps,
  isPwdNeverExpiresEnabledProps,
  isSSOEnabledProps,
  isTwoFAEnabledProps,
} from "@/features/tenant/constants/tenant-preferences-field-props";
import { preferencesSchema } from "@/features/tenant/constants/tenant-preferences-zod-schema";
import { useDefinePreferencesForm } from "@/features/tenant/hooks/useDefinePreferencesForm";

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

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof preferencesSchema>) => {
    mutate(formData);
  };

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isPending || isLoading}
      checkDirtyForm={false}
    >
      <SwitchField {...isTwoFAEnabledProps} />
      <SwitchField {...isPwdEnabledProps} />
      <SwitchField {...isSSOEnabledProps} />
      <SwitchField {...isPwdNeverExpiresEnabledProps} />
      {isPwdNeverExpiresEnabled && (
        <InputField {...daysBeforePwdExpiresProps} />
      )}
      <SwitchField {...isIdleSessionTimeoutEnabledProps} />
      {isIdleSessionTimeoutEnabled && (
        <InputField {...idleSessionTimeoutMinutesProps} />
      )}
      <div className="flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty || isPending}>
          {isSubmitting || isPending ? (
            <>
              <LoadingSpinner className="mr-1 h-4 w-4" /> Saving
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default PreferencesForm;
