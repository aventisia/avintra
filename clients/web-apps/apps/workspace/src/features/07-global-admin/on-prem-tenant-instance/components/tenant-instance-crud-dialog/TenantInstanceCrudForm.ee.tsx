import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { TenantInstanceOptimisticMutationFn } from "../../apis/tenant-instance-apis.ee";
import { TENANT_INSTANCE_QUERY_KEY } from "../../constants";
import {
  isDisabledProps,
  nameProps,
  typeProps,
} from "../../constants/tenant-instance-field-props.constant.ee";
import { tenantInstanceZodSchema } from "../../constants/tenant-instance-zod-schema.ee";
import { OnPremInstanceDto } from "../../dtos/tenant-instance-dto.ee";
import { useDefineTenantInstanceForm } from "../../hooks/useDefineTenantInstanceForm.ee";

interface TenantInstanceCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const TenantInstanceCrudForm = ({ rowId, crudAction }: TenantInstanceCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  const { form, id, isDirty, isAvailable, availabilityMessage, isCheckPending, handleInputChange } =
    useDefineTenantInstanceForm({ rowId, crudAction });

  const {
    mutate: mutateTenant,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<OnPremInstanceDto, OnPremInstanceDto | boolean, OnPremInstanceDto>(
    [rowId],
    TenantInstanceOptimisticMutationFn,
    [TENANT_INSTANCE_QUERY_KEY, id || ""],
  );

  const onSubmit = (formData: z.infer<typeof tenantInstanceZodSchema>) => {
    mutateTenant({
      payload: {
        ...formData,
        onPremTenantId: id,
      } as OnPremInstanceDto,
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

      {(isCreating || form.getValues("type") !== "") && <SelectField {...typeProps} />}

      {!isCreating && <SwitchField {...isDisabledProps} />}

      <CrudDialogActions>
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={isCreating ? "Create instance" : "Save changes"}
          secondaryText={isCreating ? "Creating..." : "Saving..."}
          isPending={isPending}
          disabled={!isDirty || !isAvailable || isCheckPending}
        />
      </CrudDialogActions>
    </Form>
  );
};
