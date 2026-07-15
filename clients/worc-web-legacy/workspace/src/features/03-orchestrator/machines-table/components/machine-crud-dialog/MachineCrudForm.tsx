import { SubmitButton } from "@aventisia/ui/buttons";
import { Form, InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { EnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import { OsTypesEnum } from "@/react-toolkit/enums/machine-os-types-enum";

import { machineOptimisticMutationFn } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  environmentTypeProps,
  hostnameProps,
  idProps,
  ipAddressProps,
  isDisabledProps,
  nameProps,
  osTypeProps,
  os_unique_idProps,
  usernameProps,
} from "../../constants/machine-form-field-props";
import { machineZodSchema } from "../../constants/machine-zod-schema";
import type { AddMachineDto } from "../../dtos/add-machine.dto";
import { MachinesTableDto } from "../../dtos/machines-table-dto";
import type { UpdateMachineDto } from "../../dtos/update-machine.dto";
import { useDefineMachineForm } from "../../hooks/useDefineMachineForm";

export const MachineCrudForm = () => {
  // Define machine form
  const { form, rowId, crudAction, isDirty, setShowDialog } =
    useDefineMachineForm();

  // Define optimistic mutation to crete or update the machine
  const {
    mutate: mutateMachine,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    AddMachineDto | UpdateMachineDto,
    MachinesTableDto | boolean,
    MachinesTableDto
  >([rowId], machineOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineZodSchema>) => {
    const machinePayload: AddMachineDto = {
      environment: formData.environment as EnvironmentTypesEnum,
      operatingSystem: formData.operatingSystem as OsTypesEnum,
      osID: formData.osID,
      username: formData.username,
      hostname: formData.hostname,
      ipAddress: formData.ipAddress || undefined,
    };

    // Create or update the machine
    mutateMachine({
      payload:
        crudAction === "create"
          ? machinePayload
          : ({
              id: formData.id,
              ...machinePayload,
              isDisabled: formData.isDisabled,
            } as UpdateMachineDto),
      crudAction: crudAction,
    });
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (isSuccess) setShowDialog(false);
  }, [isSuccess, setShowDialog]);

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
    >
      {/* Machine Id */}
      {crudAction === "update" && <InputField {...idProps} disabled />}

      <div className="grid grid-cols-2 gap-4">
        {/* Environment */}
        <SelectField {...environmentTypeProps} />

        {/* Operating system */}
        <SelectField {...osTypeProps} />
      </div>

      {/* OS Id */}
      <InputField {...os_unique_idProps} />

      {/* Username */}
      <InputField {...usernameProps} />

      {/* Host Name */}
      <InputField {...hostnameProps} />

      {/* IP Address */}
      <InputField {...ipAddressProps} />

      {/* Backend-generated machine name preview */}
      <InputField {...nameProps} disabled />

      {/* Disable machine (update mode only) */}
      {crudAction === "update" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      <div className="!mt-5 flex w-full justify-end">
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={crudAction === "create" ? "Add" : "Save changes"}
          secondaryText="Adding..."
          isPending={isPending}
          disabled={!isDirty}
        />
      </div>
    </Form>
  );
};
