import { DatabaseOptionsEnum } from "@/react-toolkit/enums/database-options-enum";

import { Button } from "@aventisia/ui/buttons";
import {
  AutherCard,
  DatePickerField,
  Form,
  InputField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { z } from "zod";

import { tenantOptimisticMutationFn } from "../../apis/tenants-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  currencyProps,
  daysBeforePwdExpiresProps,
  dbHostProps,
  dbNamePrefixProps,
  dbOptionProps,
  dbPortProps,
  dbPwdProps,
  dbUserIdProps,
  effectiveOnProps,
  idProps,
  idleSessionTimeoutMinutesProps,
  isDisabledProps,
  isIdleSessionTimeoutEnabledProps,
  isPwdEnabledProps,
  isPwdNeverExpiresEnabledProps,
  isSSOEnabledProps,
  isTwoFAEnabledProps,
  nameProps,
  renewsOnProps,
  ssoConfigJsonProps,
  typeProps,
} from "../../constants/tenant-form-field-props";
import { tenantZodSchema } from "../../constants/tenant-zod-schema";
import { TenantsTableDto } from "../../dtos/tenants-table-dto";
import { useDefineTenantForm } from "../../hooks/useDefineTenantForm";

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
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  } = useDefineTenantForm();

  // Define optimistic mutation to crete or update the tenant
  const { mutate: mutateTenant } = useListOptimisticMutation<
    TenantsTableDto,
    TenantsTableDto | boolean,
    TenantsTableDto
  >([rowId], tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof tenantZodSchema>) => {
    // Create or update the tenant
    mutateTenant({
      payload: refineFormData(formData) as unknown as TenantsTableDto,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    setShowDialog(false);
  };

  // Watch form fields
  const [
    isSSOEnabled,
    isPwdNeverExpiresEnabled,
    isIdleSessionTimeoutEnabled,
    dbOption,
  ] = watch([
    "isSSOEnabled",
    "isPwdNeverExpiresEnabled",
    "isIdleSessionTimeoutEnabled",
    "dbOption",
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
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      {form.getValues("type") || crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : null}

      {/* Currency */}
      <SelectField {...currencyProps} />

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

      {/* Database Option */}
      <RadioGroupField {...dbOptionProps} />

      {/* Database Name Prefix */}
      {dbOption !== DatabaseOptionsEnum.Shared && (
        <>
          <InputField {...dbNamePrefixProps} />
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-4">
              {/* Database User Id */}
              <InputField {...dbUserIdProps} />

              {/* Database Password */}
              <InputField {...dbPwdProps} />
            </div>
          </div>
        </>
      )}

      {dbOption === DatabaseOptionsEnum.DedicatedServer && (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            {/* Database Host */}
            <InputField {...dbHostProps} />

            {/* Database Port */}
            <InputField className="w-24" {...dbPortProps} />
          </div>
        </div>
      )}

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

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
        <div className="!mt-5 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Create tenant" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
