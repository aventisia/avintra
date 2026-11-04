import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import {
  DateTimePickerField,
  Form,
  InputField,
  SelectField,
  SwitchField,
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { OnPremTenantOptimisticMutationFn } from "../../apis/on-prem-tenant-apis.ee";
import { ON_PREM_TENANT_QUERY_KEY } from "../../constants";
import {
  contractRenewalDateProps,
  contractStartDateProps,
  executionTimeAllowedProps,
  isBrandingAllowedProps,
  isExecutionDisabledProps,
  isLoginDisabledProps,
  isSsoAllowedProps,
  nameProps,
  ourEmailsProps,
  tenantEmailsProps,
  typeProps,
} from "../../constants/on-prem-tenant-field-props.constant.ee";
import { onPremTenantZodSchema } from "../../constants/on-prem-tenant-zod-schema.ee";
import { OnPremTenantDto } from "../../dtos/on-prem-tenant-dto.ee";
import { useDefineOnPremTenantForm } from "../../hooks/useDefineOnPremTenantForm.ee";

interface OnPremTenantCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const OnPremTenantCrudForm = ({ rowId, crudAction }: OnPremTenantCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineOnPremTenantForm({ rowId, crudAction });

  const {
    mutate: mutateTenant,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<OnPremTenantDto, OnPremTenantDto | boolean, OnPremTenantDto>(
    [rowId],
    OnPremTenantOptimisticMutationFn,
    ON_PREM_TENANT_QUERY_KEY,
  );

  const onSubmit = (formData: z.infer<typeof onPremTenantZodSchema>) => {
    mutateTenant({
      payload: refineFormData(formData) as unknown as OnPremTenantDto,
      crudAction: crudAction,
    });

    onCloseConfirmed();
  };

  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);

  const isCreating = crudAction === "create";

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField {...typeProps} />
        <InputField {...executionTimeAllowedProps} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateTimePickerField {...contractStartDateProps} />
        <DateTimePickerField {...contractRenewalDateProps} />
      </div>

      <InputField {...ourEmailsProps} />

      <InputField {...tenantEmailsProps} />

      {!isCreating && (
        <>
          <SwitchField {...isSsoAllowedProps} />
          <SwitchField {...isBrandingAllowedProps} />
          <SwitchField {...isExecutionDisabledProps} />
          <SwitchField {...isLoginDisabledProps} />
        </>
      )}

      <CrudDialogActions>
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={isCreating ? "Create tenant" : "Save changes"}
          secondaryText={isCreating ? "Creating..." : "Saving..."}
          isPending={isPending}
          disabled={!isDirty || !isAvailable || isCheckPending}
        />
      </CrudDialogActions>
    </Form>
  );
};
