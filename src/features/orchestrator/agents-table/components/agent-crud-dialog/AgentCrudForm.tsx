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
import { MachineSelectTable } from "./machines-select-table/MachineSelectTable";
import { assignMachines } from "../../apis/agents-table-apis";
import { AgentAssignMachineDto } from "../../dtos/agent-assign-machine-dto";
import { Separator } from "@/react-toolkit/ui/separator";
import { useAgentsTableStore } from "../../stores/agents-table-store";
import { useShallow } from "zustand/react/shallow";
import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { useFetchAgents } from "../../hooks/useFetchAgents";

export const AgentCrudForm = () => {
  // Define agent form
  const {
    form,
    crudAction,
    setShowDialog,
    rowId: agentId,
  } = useDefineAgentForm();

  const { currentAgentMachines } = useAgentsTableStore(
    useShallow((state) => ({
      currentAgentMachines: state.currentAgentMachines,
    })),
  );

  const { refetch } = useFetchAgents();

  // Define optimistic mutation to crete or update the machine
  const { mutate: mutateAgent } = useOptimisticMutation<
    AgentAssignMachineDto,
    boolean,
    AgentAssignMachineDto & { id: string }
  >(
    assignMachines,
    [agentId],
    [
      {
        id: "",
        flowVersionId: agentId,
        machineIds: currentAgentMachines
          .filter((x) => x.isAssigned)
          .map((m) => m.id),
      },
    ],
    true,
  );

  // Define submit handler
  const onSubmit = () => {
    const payload = {
      flowVersionId: agentId,
      machineIds: currentAgentMachines
        .filter((x) => x.isAssigned)
        .map((m) => m.id),
    };

    // Create or update the machine
    mutateAgent(payload);

    // Close the dialog
    setShowDialog(false);

    //refresh the table
    refetch();
  };
  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      className="px-2.5 pb-5"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* FlowId Id */}
      {isReadMode && <InputField {...projectIdProps} disabled={isReadMode} />}

      {/* Agent Id */}
      {isReadMode && <InputField {...idProps} disabled={isReadMode} />}

      {/* Name */}
      <InputField {...nameProps} disabled={isReadMode} />

      {/* machine count */}
      <InputField {...machineCountProps} disabled={isReadMode} />

      {/* version number */}
      <InputField {...versionNumberProps} disabled={isReadMode} />

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField {...isDisabledProps} disabled={isReadMode} />
      )}

      <div className="mt-2 h-fit w-[38rem]">
        <MachineSelectTable isRowSelectionEnabled={crudAction !== "read"} />
      </div>

      {/* AutherCard */}
      {isReadMode && (
        <div className="!mt-10">
          <Separator />
          <AutherCard
            createdBy={form.getValues("createdBy") ?? ""}
            createdOn={form.getValues("createdOn") ?? new Date()}
            lastModifiedBy={form.getValues("lastModifiedBy") ?? ""}
            lastModifiedOn={form.getValues("lastModifiedOn") ?? new Date()}
          />
        </div>
      )}
      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button type="submit" className="min-w-[5rem]">
            {crudAction === "create" ? "Create agent" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
