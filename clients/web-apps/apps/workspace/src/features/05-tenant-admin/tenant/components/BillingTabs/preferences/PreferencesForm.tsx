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
  isSSOEnabledProps,
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
    ssoDisableWarning,
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
      {ssoDisableWarning && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Single sign-on is disabled</p>
          <p>
            {ssoDisableWarning.affectedUserCount} user(s) have no password and cannot sign in until they set one.
            {ssoDisableWarning.affectedAdmins.length > 0 &&
              ` Affected admins: ${ssoDisableWarning.affectedAdmins.join(", ")}.`}
          </p>
          {ssoDisableWarning.recoveryHint && <p className="mt-1">{ssoDisableWarning.recoveryHint}</p>}
        </div>
      )}
      <SwitchField {...isTwoFAEnabledProps} />
      <SwitchField {...isSSOEnabledProps} />
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
