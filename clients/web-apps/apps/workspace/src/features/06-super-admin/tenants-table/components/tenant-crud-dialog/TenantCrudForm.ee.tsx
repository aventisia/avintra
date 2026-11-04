import { Button } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { DatabaseOptionsEnum } from "@avplatform/ui/enums/database-options-enum";
import {
  DateTimePickerField,
  Form,
  InputField,
  SelectField,
  SwitchField,
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { z } from "zod";

import { tenantOptimisticMutationFn } from "../../apis/tenants-table-apis.ee";
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
  domainProps,
  effectiveOnProps,
  idleSessionTimeoutMinutesProps,
  isChangeRequestEnabledProps,
  isDisabledProps,
  isIdleSessionTimeoutEnabledProps,
  isPwdEnabledProps,
  isPwdNeverExpiresEnabledProps,
  isSSOEnabledProps,
  isTwoFAEnabledProps,
  nameProps,
  renewsOnProps,
  typeProps,
} from "../../constants/tenant-form-field-props.constant.ee";
import { tenantZodSchema } from "../../constants/tenant-zod-schema.constant.ee";
import { TenantsTableDto } from "../../dtos/tenants-table-dto.ee";
import { useDefineTenantForm } from "../../hooks/useDefineTenantForm.ee";

interface TenantCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const TenantCrudForm = ({ rowId, crudAction }: TenantCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const {
    form,
    watch,
    isDirty,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  } = useDefineTenantForm({ rowId, crudAction });

  const { mutate: mutateTenant } = useListOptimisticMutation<
    TenantsTableDto,
    TenantsTableDto | boolean,
    TenantsTableDto
  >([rowId], tenantOptimisticMutationFn, DATA_QUERY_KEY);

  const onSubmit = (formData: z.infer<typeof tenantZodSchema>) => {
    mutateTenant({
      payload: refineFormData(formData) as unknown as TenantsTableDto,
      crudAction: crudAction,
    });

    setAvailabilityMessage(null);

    onCloseConfirmed();
  };

  const [isSSOEnabled, isPwdNeverExpiresEnabled, isIdleSessionTimeoutEnabled, dbOption] = watch([
    "isSSOEnabled",
    "isPwdNeverExpiresEnabled",
    "isIdleSessionTimeoutEnabled",
    "dbOption",
  ]);

  // IMPORTANT NOTE: SSO can only be turned on after a Tenant Admin has bound the identity provider.
  const isSsoSwitchDisabled = crudAction === "create" || !isSSOEnabled;

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />
      <InputField {...domainProps} />
      <div className="grid grid-cols-2 gap-3">
        {(form.getValues("type") || crudAction === "create") && <SelectField {...typeProps} />}
        <SelectField {...currencyProps} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DateTimePickerField {...effectiveOnProps} />
        <DateTimePickerField {...renewsOnProps} />
      </div>

      <SelectField {...dbOptionProps} />
      {dbOption !== DatabaseOptionsEnum.Shared && (
        <>
          <InputField {...dbNamePrefixProps} />
          <div className="grid grid-cols-2 gap-3">
            <InputField {...dbUserIdProps} />
            <InputField {...dbPwdProps} />
          </div>
        </>
      )}
      {dbOption === DatabaseOptionsEnum.DedicatedServer && (
        <div className="grid grid-cols-[1fr_8rem] gap-3">
          <InputField {...dbHostProps} />
          <InputField {...dbPortProps} />
        </div>
      )}

      <SwitchField {...isPwdEnabledProps} />
      <SwitchField
        {...isSSOEnabledProps}
        disabled={isSsoSwitchDisabled}
        description={
          isSsoSwitchDisabled
            ? `${isSSOEnabledProps.description}. A Tenant Admin must connect the identity provider first.`
            : `${isSSOEnabledProps.description}, configured by the Tenant Admin.`
        }
      />
      <SwitchField {...isTwoFAEnabledProps} />
      <SwitchField {...isPwdNeverExpiresEnabledProps} />
      {!isPwdNeverExpiresEnabled && <InputField {...daysBeforePwdExpiresProps} isRequired />}
      <SwitchField {...isIdleSessionTimeoutEnabledProps} />
      {isIdleSessionTimeoutEnabled && <InputField {...idleSessionTimeoutMinutesProps} isRequired />}
      <SwitchField {...isChangeRequestEnabledProps} />

      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}
      <CrudDialogActions>
        <Button
          type="submit"
          disabled={!isDirty || !isAvailable || isCheckPending}
          className="min-w-[5rem]"
        >
          {crudAction === "create" ? "Create tenant" : "Save changes"}
        </Button>
      </CrudDialogActions>
    </Form>
  );
};
