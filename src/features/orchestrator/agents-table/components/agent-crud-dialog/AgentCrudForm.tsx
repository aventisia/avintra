import { useShallow } from 'zustand/react/shallow';

import { useOptimisticMutation } from '@/react-toolkit/hooks/useOptimisticMutation';
import { Button } from '@/react-toolkit/ui/buttons/Button';
import { InputField } from '@/react-toolkit/ui/form/fields/InputField';
import { SwitchField } from '@/react-toolkit/ui/form/fields/SwitchField';
import { Form } from '@/react-toolkit/ui/form/Form';
import { AutherCard } from '@/react-toolkit/ui/form/non-field/AutherCard';
import { Separator } from '@/react-toolkit/ui/separator';

import { assignMachines } from '../../apis/agents-table-apis';
import {
    idProps, isDisabledProps, machineCountProps, nameProps, versionNumberProps
} from '../../constants/agent-form-field-props';
import { AgentAssignMachineDto } from '../../dtos/agent-assign-machine-dto';
import { useDefineAgentForm } from '../../hooks/useDefineAgentForm';
import { useMachinesSelectTableStore } from '../../stores/machines-select-table-store';
import { LicenseDiv } from './LicenseDiv';
import { MachineSelectTable } from './machines-select-table/MachineSelectTable';

export const AgentCrudForm = () => {
  // Define agent form
  const {
    form,
    crudAction,
    setShowDialog,
    rowId: agentId,
  } = useDefineAgentForm();

  const { currentAgentMachines } = useMachinesSelectTableStore(
    useShallow((state) => ({
      currentAgentMachines: state.currentMachines,
    })),
  );

  // Define optimistic mutation to crete or update the machine
  const { mutate: mutateAgent } = useOptimisticMutation<
    AgentAssignMachineDto,
    boolean,
    AgentAssignMachineDto & { id: string }
  >(
    assignMachines,
    ["machines-to-select", agentId],
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
      {/* Agent Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField {...nameProps} />

      {/* machine count */}
      <InputField {...machineCountProps} />

      {/* version number */}
      <InputField {...versionNumberProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField {...isDisabledProps} disabled={isReadMode} />
      )}

      <LicenseDiv
        isReadOnly={isReadMode}
        value={form.getValues("licenseType")}
      />

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
