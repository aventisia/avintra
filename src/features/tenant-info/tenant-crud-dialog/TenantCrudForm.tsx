import { z } from "zod";

import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DatePickerField } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

import { tenantOptimisticMutationFn } from "../apis/tenant-info-apis";
import { DATA_QUERY_KEY } from "../constants";
import {
    daysBeforePwdExpiresProps, effectiveOnProps, idleSessionTimeoutMinutesProps, idProps,
    isIdleSessionTimeoutEnabledProps, isPwdEnabledProps, isPwdNeverExpiresEnabledProps,
    isSSOEnabledProps, isTwoFAEnabledProps, nameProps, renewsOnProps, ssoConfigJsonProps, typeProps
} from "../constants/tenant-form-field-props";
import { tenantZodSchema } from "../constants/tenant-zod-schema";
import { TenantDto } from "../dtos/tenant-dto";
import { useDefineTenantForm } from "../hooks/useDefineTenantForm";

export const TenantCrudForm = () => {
  // Define tenant form
  const {
    form,
    watch,
    isDirty,
    rowId,
    crudAction,
    setShowDialog,
    refineFormData,
  } = useDefineTenantForm();

  // Define optimistic mutation to crete or update the tenant
  const { mutate: mutateTenant } = useListOptimisticMutation<
    TenantDto,
    TenantDto | boolean,
    TenantDto
  >([rowId], tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof tenantZodSchema>) => {
    // Create or update the tenant
    mutateTenant({
      payload: refineFormData(formData) as unknown as TenantDto,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };

  // Watch form fields
  const [isSSOEnabled, isPwdNeverExpiresEnabled, isIdleSessionTimeoutEnabled] =
    watch([
      "isSSOEnabled",
      "isPwdNeverExpiresEnabled",
      "isIdleSessionTimeoutEnabled",
    ]);

  // Is form in read mode
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Tenant Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField {...nameProps} />

      <SelectField {...typeProps} />

      {/* Effective date */}
      <DatePickerField {...effectiveOnProps} />

      {/* renewal date */}
      <DatePickerField {...renewsOnProps} />

      {/* Is TwoFA Enabled*/}
      <SwitchField {...isTwoFAEnabledProps} />

      {/* Is Password Enabled */}
      <SwitchField {...isPwdEnabledProps} />

      {/* Is SSO Enabled */}
      <SwitchField {...isSSOEnabledProps} />

      {/* SSO Config JSON */}
      {isSSOEnabled && (
        <TextareaField {...ssoConfigJsonProps} isRequired={isSSOEnabled} />
      )}

      {/* Is Password Never Expires Enabled */}
      <SwitchField {...isPwdNeverExpiresEnabledProps} />

      {/* Days Before Password Expires */}
      {!isPwdNeverExpiresEnabled && (
        <InputField
          {...daysBeforePwdExpiresProps}
          isRequired={!isPwdNeverExpiresEnabled}
        />
      )}

      {/* Is Idle Session Timeout Enabled */}
      <SwitchField {...isIdleSessionTimeoutEnabledProps} />

      {/* Idle Session Timeout Minutes */}
      {isIdleSessionTimeoutEnabled && (
        <InputField
          {...idleSessionTimeoutMinutesProps}
          isRequired={isIdleSessionTimeoutEnabled}
        />
      )}

      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            Save changes
          </Button>
        </div>
      )}
    </Form>
  );
};
