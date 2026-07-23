import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputField, SwitchField } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { SelectField } from "@/components/select-field/SelectField";

import { TenantInstanceOptimisticMutationFn } from "../../apis/tenant-instance-apis";
import { TENANT_INSTANCE_QUERY_KEY } from "../../constants";
import {
  idProps,
  isDisabledProps,
  nameProps,
  typeProps,
} from "../../constants/tenant-instance-field-props";
import { tenantInstanceZodSchema } from "../../constants/tenant-instance-zod-schema";
import { OnPremInstanceDto } from "../../dtos/tenant-instance-dto";
import { useDefineTenantInstanceForm } from "../../hooks/useDefineTenantInstanceForm";

export const TenantInstanceCrudForm = () => {
  // Define on-prem tenant instance form
  const {
    form,
    rowId,
    id,
    isDirty,
    crudAction,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
  } = useDefineTenantInstanceForm();

  // Define optimistic mutation to crete or update the tenant
  const {
    mutate: mutateTenant,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<OnPremInstanceDto, OnPremInstanceDto | boolean, OnPremInstanceDto>(
    [rowId],
    TenantInstanceOptimisticMutationFn,
    [TENANT_INSTANCE_QUERY_KEY, id || ""],
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof tenantInstanceZodSchema>) => {
    // Create or update the tenant
    mutateTenant({
      payload: {
        ...formData,
        onPremTenantId: id,
      } as OnPremInstanceDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating the record
    if (crudAction !== "create") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) setShowDialog(false);
  }, [isSuccess, crudAction, setShowDialog]);

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

      {/* Type */}
      {crudAction === "create" ? (
        <SelectField {...typeProps} />
      ) : (
        form.getValues("type") !== "" && <SelectField {...typeProps} />
      )}

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText="Creating..."
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
