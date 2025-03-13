import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { machineOptimisticMutationFn } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  hostnameProps,
  idProps,
  ipAddressProps,
  isDisabledProps,
  nameProps,
  environmentTypeProps,
  osTypeProps,
} from "../../constants/machine-form-field-props";
import { machineZodSchema } from "../../constants/machine-zod-schema";
import { MachinesTableDto } from "../../dtos/machines-table-dto";
import { useDefineMachineForm } from "../../hooks/useDefineMachineForm";
import { AgentSelectTable } from "./agents-select-table/AgentSelectTable";
import { useFetchSelectAgents } from "../../hooks/useFetchSelectAgents";
import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { agentSelectTableColumnVisibilityState } from "../../constants/column-visibility-state";
import { agentSelectTableColumns } from "./agents-select-table/AgentSelectTableColumns";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

export const MachineCrudForm = () => {
  // Define machine form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineMachineForm();

  // Define optimistic mutation to crete or update the machine
  const { mutate: mutateMachine } = useListOptimisticMutation<
    MachinesTableDto,
    MachinesTableDto | boolean,
    MachinesTableDto
  >([rowId], machineOptimisticMutationFn, DATA_QUERY_KEY);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Fetch agents data
  const { data, isFetching } = useFetchSelectAgents();

  // Create a React table for agents data
  const table = useDataTable(
    agentSelectTableColumns,
    data?.data || [],
    agentSelectTableColumnVisibilityState,
    true,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineZodSchema>) => {
    const payload = {
      ...(refineFormData(formData) as unknown as MachinesTableDto),
      agentIds: table
        .getSelectedRowModel()
        .rows.map((x) => x.getValue<string>("id")),
    };

    // Create or update the machine
    mutateMachine({
      payload: payload,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    setShowDialog(false);
  };

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* Machine Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />

      <div className="grid grid-cols-2 gap-2">
        {/* os type */}
        {crudAction === "create" ? (
          <SelectField {...osTypeProps} />
        ) : (
          form.getValues("type") !== "" && <SelectField {...osTypeProps} />
        )}

        {/* Ip Address */}
        <InputField {...ipAddressProps} />
      </div>

      {/* Host Name */}
      <InputField {...hostnameProps} />

      {/* environment */}
      {form.getValues("environment") !== "" && (
        <SelectField {...environmentTypeProps} />
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

      <div className="mt-2 h-fit">
        {isFetching ? (
          <DataTableSkeleton />
        ) : (
          <AgentSelectTable
            table={table}
            isRowSelectionEnabled={crudAction !== "read"}
          />
        )}
      </div>

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-12 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Add" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
