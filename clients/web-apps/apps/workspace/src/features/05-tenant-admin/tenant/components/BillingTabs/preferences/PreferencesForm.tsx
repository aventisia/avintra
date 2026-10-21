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
} from "@/features/05-tenant-admin/tenant/constants/tenant-preferences-field-props";
import { preferencesSchema } from "@/features/05-tenant-admin/tenant/constants/tenant-preferences-zod-schema";
import { useDefinePreferencesForm } from "@/features/05-tenant-admin/tenant/hooks/useDefinePreferencesForm";

import TabLoader from "../TabLoader";

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

  if (isLoading) return <TabLoader />;

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isSubmitting || isPending || isLoading}
      checkDirtyForm={false}
    >
      <SwitchField {...isTwoFAEnabledProps} />

      <div className="hidden">
        <SwitchField {...isPwdEnabledProps} />
      </div>
      <SwitchField {...isPwdNeverExpiresEnabledProps} />
      {!isPwdNeverExpiresEnabled && <InputField {...daysBeforePwdExpiresProps} />}
      <div className="hidden">
        <SwitchField {...isIdleSessionTimeoutEnabledProps} />
        {isIdleSessionTimeoutEnabled && <InputField {...idleSessionTimeoutMinutesProps} />}
      </div>
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
