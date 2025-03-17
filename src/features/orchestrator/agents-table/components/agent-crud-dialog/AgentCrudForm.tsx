import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import {
  idProps,
  isDisabledProps,
  machineCountProps,
  nameProps,
  projectIdProps,
  versionNumberProps,
} from "../../constants/agent-form-field-props";
import { useDefineAgentForm } from "../../hooks/useDefineAgentForm";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { MachineSelectTable } from "./machines-select-table/MachineSelectTable";
import { useFetchMachines } from "../../hooks/useFetchMachines";
import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { machineSelectTableColumns } from "./machines-select-table/MachineSelectTableColumns";
import { machineSelectTableColumnVisibilityState } from "../../constants/column-visibility-state";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { AgentOptimisticMutationFn } from "../../apis/agents-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import type { AgentAssignMachineDto } from "../../dtos/agent-assign-machine-dto";

export const AgentCrudForm = () => {
  // Define agent form
  const {
    form,
    isDirty,
    // toggleFormDirty,
    crudAction,
    setShowDialog,
    rowId: agentId,
  } = useDefineAgentForm();

  // Fetch nachines data
  const { data, isFetching } = useFetchMachines(agentId);

  // Create a React table for agents data
  const table = useDataTable(
    machineSelectTableColumns,
    data?.data || [],
    machineSelectTableColumnVisibilityState,
    true,
  );

  // Define optimistic mutation to crete or update the machine
  const { mutate: mutateAgent } = useListOptimisticMutation<
    AgentAssignMachineDto,
    AgentAssignMachineDto | boolean,
    AgentAssignMachineDto & { id: string }
  >([agentId], AgentOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = () => {
    const payload = {
      flowVersionId: agentId,
      machineIds: table
        .getSelectedRowModel()
        .rows.map((x) => x.getValue<string>("id")),
    };

    console.log(payload);
    // Create or update the machine
    mutateAgent({
      payload: payload,
      crudAction: crudAction,
    });

    // Close the dialog
    setShowDialog(false);
  };
  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      className="px-2.5 pb-5"
      disabled={isReadMode}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* FlowId Id */}
      {isReadMode && <InputField {...projectIdProps} />}

      {/* Agent Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField {...nameProps} />

      {/* machine count */}
      <InputField {...machineCountProps} />

      {/* version number */}
      <InputField {...versionNumberProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy") ?? ""}
          createdOn={form.getValues("createdOn") ?? new Date()}
          lastModifiedBy={form.getValues("lastModifiedBy") ?? ""}
          lastModifiedOn={form.getValues("lastModifiedOn") ?? new Date()}
        />
      )}

      <div className="mt-2 h-fit w-[38rem]">
        {isFetching ? (
          <DataTableSkeleton />
        ) : (
          <MachineSelectTable
            table={table}
            isRowSelectionEnabled={crudAction !== "read"}
          />
        )}
      </div>

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            {crudAction === "create" ? "Create agent" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
