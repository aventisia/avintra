import { DatabaseOptionsEnum } from "@/react-toolkit/enums/database-options-enum";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DatePickerField } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { RadioGroupField } from "@/react-toolkit/ui/form/fields/RadioGroupField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { TextareaField } from "@/react-toolkit/ui/form/fields/TextareaField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { tenantOptimisticMutationFn } from "../../apis/tenants-table-apis";
import { DATA_QUERY_KEY } from "../../constants/constants";
import {
  daysBeforePwdExpiresProps,
  dbHostProps,
  dbNamePrefixProps,
  dbOptionProps,
  dbPortProps,
  dbPwdProps,
  dbUserIdProps,
  expiresOnProps,
  idleSessionTimeoutMinutesProps,
  idProps,
  isDisabledProps,
  isIdleSessionTimeoutEnabledProps,
  isPwdEnabledProps,
  isPwdNeverExpiresEnabledProps,
  isSSOEnabledProps,
  isTwoFAEnabledProps,
  nameProps,
  ssoConfigJsonProps,
} from "../../constants/tenant-form-field-props";
import { tenantZodSchema } from "../../constants/tenant-zod-schema";
import { TenantsTableDto } from "../../dtos/tenants-table-dto";
import { useDefineTenantForm } from "../../hooks/useDefineTenantForm";

export const TenantCrudForm = () => {
  // Define tenant form
  const { form, watch, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineTenantForm();

  // Define optimistic mutation to crete or update the tenant
  const { mutate: mutateTenant } = useListOptimisticMutation<
    TenantsTableDto,
    TenantsTableDto | boolean,
    TenantsTableDto
  >(tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof tenantZodSchema>) => {
    // Create or update the tenant
    mutateTenant({
      id: rowId,
      payload: refineFormData(formData) as unknown as TenantsTableDto,
      crudAction: crudAction,
    });

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
    <Form methods={form}>
      <form
        className="w-full space-y-3.5 px-2.5 pb-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Tenant Id */}
        {isReadMode && <InputField {...idProps} />}

        {/* Name */}
        <InputField {...nameProps} disabled={isReadMode} />

        {/* Expires On */}
        <DatePickerField {...expiresOnProps} disabled={isReadMode} />

        {/* Is TwoFA Enabled*/}
        <SwitchField {...isTwoFAEnabledProps} disabled={isReadMode} />

        {/* Is Password Enabled */}
        <SwitchField {...isPwdEnabledProps} disabled={isReadMode} />

        {/* Is SSO Enabled */}
        <SwitchField {...isSSOEnabledProps} disabled={isReadMode} />

        {/* SSO Config JSON */}
        {isSSOEnabled && (
          <TextareaField
            {...ssoConfigJsonProps}
            disabled={isReadMode}
            isRequired={isSSOEnabled}
          />
        )}

        {/* Is Password Never Expires Enabled */}
        <SwitchField {...isPwdNeverExpiresEnabledProps} disabled={isReadMode} />

        {/* Days Before Password Expires */}
        {!isPwdNeverExpiresEnabled && (
          <InputField
            {...daysBeforePwdExpiresProps}
            disabled={isReadMode}
            isRequired={!isPwdNeverExpiresEnabled}
          />
        )}

        {/* Is Idle Session Timeout Enabled */}
        <SwitchField
          {...isIdleSessionTimeoutEnabledProps}
          disabled={isReadMode}
        />

        {/* Idle Session Timeout Minutes */}
        {isIdleSessionTimeoutEnabled && (
          <InputField
            {...idleSessionTimeoutMinutesProps}
            disabled={isReadMode}
            isRequired={isIdleSessionTimeoutEnabled}
          />
        )}

        {/* Database Option */}
        <RadioGroupField {...dbOptionProps} disabled={isReadMode} />

        {/* Database Name Prefix */}
        {dbOption !== DatabaseOptionsEnum.Shared && (
          <>
            <InputField {...dbNamePrefixProps} disabled={isReadMode} />
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-4">
                {/* Database User Id */}
                <InputField {...dbUserIdProps} disabled={isReadMode} />

                {/* Database Password */}
                <InputField {...dbPwdProps} disabled={isReadMode} />
              </div>
            </div>
          </>
        )}

        {dbOption === DatabaseOptionsEnum.DedicatedServer && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-[1fr_auto] gap-4">
              {/* Database Host */}
              <InputField {...dbHostProps} disabled={isReadMode} />

              {/* Database Port */}
              <InputField
                className="w-24"
                {...dbPortProps}
                disabled={isReadMode}
              />
            </div>
          </div>
        )}

        {/* Is Disabled */}
        {crudAction !== "create" && (
          <SwitchField {...isDisabledProps} disabled={isReadMode} />
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
        {crudAction !== "read" && (
          <div className="!mt-5 flex w-full justify-end">
            <Button type="submit" className="min-w-[5rem]">
              {crudAction === "create" ? "Create tenant" : "Save changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
