import { SubmitButton } from "@avplatform/ui/buttons";
import { AsyncMultiSelectField } from "@avplatform/ui/components/form/fields/AsyncMultiSelectField";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SwitchField } from "@avplatform/ui/form";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { ISelectOption } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { searchFlowVersions } from "@/features/search-by-query/apis/search-flow-version.api";

import { updateMachine } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { idProps, hostnameProps, isDisabledProps, nameProps } from "../../constants/machine-form-field-props";
import { machineZodSchema } from "../../constants/machine-zod-schema";
import { MachinesTableRowDto } from "../../dtos/machines-table-row-dto";
import type { UpdateMachineDto } from "../../dtos/update-machine.dto";
import { useDefineMachineForm } from "../../hooks/useDefineMachineForm";

interface MachineCrudFormProps {
  rowId: string;
}

export const MachineCrudForm = ({ rowId }: MachineCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define machine form
  const { form, isDirty, isValid } = useDefineMachineForm({ rowId });

  // Define optimistic mutation to update the machine
  const {
    mutate: mutateMachine,
    isPending,
    isSuccess,
  } = useTableRowOptimisticMutation<
    UpdateMachineDto,
    MachinesTableRowDto,
    MachinesTableRowDto
  >(
    "update",
    [rowId],
    updateMachine,
    DATA_QUERY_KEY,
    "desc",
    true,
    // Invalidate the machine detail query so the read view reflects assigned agents immediately.
    [["machine", rowId]],
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineZodSchema>) => {
    const flowVersionIds = (formData.flowVersionIds ?? [])
      .map((flowVersion) => (typeof flowVersion === "string" ? flowVersion : flowVersion.value))
      .filter((id): id is string => Boolean(id));

    const machinePayload: UpdateMachineDto = {
      id: rowId,
      flowVersionIds,
      isDisabled: formData.isDisabled,
    };

    // Update the machine
    mutateMachine(machinePayload);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);

  // Return the form
  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="px-2.5 pb-5">
      {/* Machine Id */}
      <InputField {...idProps} />

      {/* Host Name */}
      <InputField {...hostnameProps} />

      {/* Machine name preview */}
      <InputField {...nameProps} />

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

      {/* Disable machine */}
      <SwitchField {...isDisabledProps} />

      {/* Submit button */}
      <div className="!mt-5 flex w-full justify-end">
        <SubmitButton
          className="min-w-[5rem]"
          primaryText="Save changes"
          secondaryText="Saving..."
          isPending={isPending}
          disabled={!isDirty || !isValid || isPending}
        />
      </div>
    </Form>
  );
};
