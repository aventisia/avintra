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
  idProps,
  isBrandingAllowedProps,
  isExecutionDisabledProps,
  isLoginDisabledProps,
  isSsoAllowedProps,
  nameProps,
  ourEmailsProps,
  tenantEmailsProps,
  typeProps,
} from "../../constants/on-prem-tenant-field-props.ee";
import { onPremTenantZodSchema } from "../../constants/on-prem-tenant-zod-schema.ee";
import { OnPremTenantDto } from "../../dtos/on-prem-tenant-dto.ee";
import { useDefineOnPremTenantForm } from "../../hooks/useDefineOnPremTenantForm.ee";

interface OnPremTenantCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const OnPremTenantCrudForm = ({ rowId, crudAction }: OnPremTenantCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define on-prem tenant form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineOnPremTenantForm({ rowId, crudAction });

  // Define optimistic mutation to crete or update the tenant
  const {
    mutate: mutateTenant,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<OnPremTenantDto, OnPremTenantDto | boolean, OnPremTenantDto>(
    [rowId],
    OnPremTenantOptimisticMutationFn,
    ON_PREM_TENANT_QUERY_KEY,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof onPremTenantZodSchema>) => {
    // Create or update the tenant
    mutateTenant({
      payload: refineFormData(formData) as unknown as OnPremTenantDto,
      crudAction: crudAction,
    });

    // Close the dialog
    onCloseConfirmed();
  };

  // Close dialog when mutation is successful
  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);

  // Is form in read mode?
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

      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && <SelectField {...typeProps} />
      )}

      <InputField {...executionTimeAllowedProps} />

      <DateTimePickerField {...contractStartDateProps} />

      <DateTimePickerField {...contractRenewalDateProps} />

      <InputField {...ourEmailsProps} />

      <InputField {...tenantEmailsProps} />

      {/* Disable Execution */}
      {crudAction !== "create" && <SwitchField {...isExecutionDisabledProps} />}

      {/* Disable Login */}
      {crudAction !== "create" && <SwitchField {...isLoginDisabledProps} />}

      {/* Allow Single Sign-On */}
      {crudAction !== "create" && <SwitchField {...isSsoAllowedProps} />}

      {/* Allow Custom Branding */}
      {crudAction !== "create" && <SwitchField {...isBrandingAllowedProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <CrudDialogActions>
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText="Creating..."
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </CrudDialogActions>
      )}
    </Form>
  );
};
