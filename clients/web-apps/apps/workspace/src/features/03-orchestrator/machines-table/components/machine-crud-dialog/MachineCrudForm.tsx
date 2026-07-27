import { SubmitButton } from "@avplatform/ui/buttons";
import { AsyncMultiSelectField } from "@avplatform/ui/components/form/fields/AsyncMultiSelectField";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { EnvironmentTypesEnum } from "@avplatform/ui/enums/environment-types-enum";
import { OsTypesEnum } from "@avplatform/ui/enums/os-types-enum";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { ISelectOption } from "@avplatform/ui/types";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { searchFlowVersions } from "@/features/search-by-query/apis/search-flow-version.api";

import { insertOrUpdateMachine } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  environmentTypeProps,
  getOsUniqueIdProps,
  hostnameProps,
  idProps,
  ipAddressProps,
  isDisabledProps,
  nameProps,
  osTypeProps,
  usernameProps,
} from "../../constants/machine-form-field-props";
import { machineZodSchema } from "../../constants/machine-zod-schema";
import type { AddMachineDto } from "../../dtos/add-machine.dto";
import { MachinesTableRowDto } from "../../dtos/machines-table-row-dto";
import type { UpdateMachineDto } from "../../dtos/update-machine.dto";
import { useDefineMachineForm } from "../../hooks/useDefineMachineForm";

interface MachineCrudFormProps {
  rowId: string;
  crudAction: "create" | "update";
}

export const MachineCrudForm = ({ rowId, crudAction }: MachineCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define machine form
  const { form, isDirty, isValid } = useDefineMachineForm({ rowId, crudAction });

  const operatingSystem = useWatch({
    control: form.control,
    name: "operatingSystem",
  });

  // Define optimistic mutation to crete or update the machine
  const {
    mutate: mutateMachine,
    isPending,
    isSuccess,
  } = useTableRowOptimisticMutation<
    AddMachineDto | UpdateMachineDto,
    MachinesTableRowDto,
    MachinesTableRowDto
  >(
    crudAction,
    [rowId],
    insertOrUpdateMachine,
    DATA_QUERY_KEY,
    "desc",
    true,
    // Invalidate the machine detail query so the read view reflects assigned agents immediately.
    crudAction === "update" ? [["machine", rowId]] : [],
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineZodSchema>) => {
    const flowVersionIds = (formData.flowVersionIds ?? [])
      .map((flowVersion) => (typeof flowVersion === "string" ? flowVersion : flowVersion.value))
      .filter((id): id is string => Boolean(id));

    const machinePayload: AddMachineDto = {
      environment: formData.environment as EnvironmentTypesEnum,
      operatingSystem: formData.operatingSystem as OsTypesEnum,
      osID: formData.osID,
      username: formData.username,
      hostname: formData.hostname,
      ipAddress: formData.ipAddress || undefined,
      flowVersionIds,
    };

    // Create or update the machine
    mutateMachine({
      ...(crudAction === "update" && {
        id: rowId,
        isDisabled: formData.isDisabled,
      }),
      ...machinePayload,
    } as AddMachineDto | UpdateMachineDto);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);

  // Return the form
  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="px-2.5 pb-5">
      {/* Machine Id */}
      {crudAction === "update" && <InputField {...idProps} disabled />}

      <div className="grid grid-cols-2 gap-4">
        {/* Environment */}
        <SelectField {...environmentTypeProps} />

        {/* Operating system */}
        <SelectField {...osTypeProps} />
      </div>

      {/* OS Id */}
      <InputField {...getOsUniqueIdProps(operatingSystem)} />

      {/* Username */}
      <InputField {...usernameProps} />

      {/* Host Name */}
      <InputField {...hostnameProps} />

      {/* IP Address */}
      <InputField {...ipAddressProps} />

      {/* Backend-generated machine name preview */}
      <InputField {...nameProps} disabled />

      {/* Flow Versions */}
      <AsyncMultiSelectField<ISelectOption>
        fetcher={(query) => searchFlowVersions(query).then((res) => res.data ?? [])}
        name="flowVersionIds"
        label="Machine Agents"
        queryKeyBase={["machine-form-flow-versions", rowId]}
        getItemId={(item) => item.value}
        getItemLabel={(item) => item.label}
        filters={undefined}
        placeholder="Search agents..."
        description="Select one or more agents to assign to this machine."
      />

      {/* Disable machine (update mode only) */}
      {crudAction === "update" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      <div className="!mt-5 flex w-full justify-end">
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={crudAction === "create" ? "Add" : "Save changes"}
          secondaryText="Adding..."
          isPending={isPending}
          disabled={!isDirty || !isValid || isPending}
        />
      </div>
    </Form>
  );
};
