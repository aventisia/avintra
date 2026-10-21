import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form, InputField, SwitchField, type SwitchFieldProps } from "@avplatform/ui/form";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { ROLE_TA } from "@/constants/roles";
import {
  daysBeforePwdExpiresProps,
  idleSessionTimeoutMinutesProps,
  isIdleSessionTimeoutEnabledProps,
  isPwdEnabledProps,
  isPwdNeverExpiresEnabledProps,
  isSSOEnabledProps,
  isTwoFAEnabledProps,
  ssoAdminOnlyNotice,
  ssoConnectRequiredHint,
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
    isSSOEnabled,
    isSsoConnected,
    ssoDisableWarning,
  } = useDefinePreferencesForm();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );
  const isTenantAdmin = Boolean(userSession?.userRoles.includes(ROLE_TA));
  const isSsoToggleDisabled = !isSsoConnected && !isSSOEnabled;
  const ssoEnabledFieldProps: SwitchFieldProps = isSsoToggleDisabled
    ? { ...isSSOEnabledProps, disabled: true, description: ssoConnectRequiredHint }
    : isSSOEnabledProps;

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
      {isTenantAdmin ? (
        <SwitchField {...ssoEnabledFieldProps} />
      ) : (
        <div className="flex flex-row items-center justify-between gap-8 rounded-lg border p-4 pt-3.5">
          <div className="space-y-1">
            <p className="text-sm font-medium">{isSSOEnabledProps.label}</p>
            <p className="text-xs text-muted-foreground">{isSSOEnabledProps.description}</p>
          </div>
          <p className="text-sm text-muted-foreground">{ssoAdminOnlyNotice}</p>
        </div>
      )}
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
