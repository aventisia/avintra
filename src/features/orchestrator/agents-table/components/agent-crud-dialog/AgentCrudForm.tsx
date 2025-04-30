import { getLicense } from "@/features/orchestrator/licenses-table/apis/licenses-table-apis";
import { MyLicensesTableDto } from "@/features/orchestrator/licenses-table/dtos/licenses-table-dto";
import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { Separator } from "@/react-toolkit/ui/separator";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { assignMachines } from "../../apis/agents-table-apis";
import {
  idProps,
  isDisabledProps,
  licenseSelectProps,
  machineCountProps,
  nameProps,
  versionNumberProps,
} from "../../constants/agent-form-field-props";
import { AgentAssignMachineDto } from "../../dtos/agent-assign-machine-dto";
import { useDefineAgentForm } from "../../hooks/useDefineAgentForm";
import { useMachinesSelectTableStore } from "../../stores/machines-select-table-store";
import { MachineSelectTable } from "./machines-select-table/MachineSelectTable";

export const AgentCrudForm = () => {
  // Define agent form
  const {
    form,
    crudAction,
    setShowDialog,
    rowId: agentId,
  } = useDefineAgentForm();

  const [licenseDetails, setLicenseDetails] = useState<MyLicensesTableDto>();

  const { currentAgentMachines, setAvailableLicenses } =
    useMachinesSelectTableStore(
      useShallow((state) => ({
        currentAgentMachines: state.currentMachines,
        setAvailableLicenses: state.setAvailableLicenses,
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

  const [licenseType] = form.watch(["licenseId"]);

  useEffect(() => {
    const getLicenseDetails = async () => {
      if (!licenseType) {
        setAvailableLicenses(0);
        setLicenseDetails(undefined);
        return;
      }
      const response = await getLicense(licenseType);
      setAvailableLicenses(response.data.available);
      setLicenseDetails(response.data);
    };
    getLicenseDetails();
  }, [form, licenseType, setAvailableLicenses]);

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

      <div className="flex flex-col gap-4">
        {/* license type */}
        <AsyncSelectField {...licenseSelectProps} />
        <div className="flex flex-row justify-between rounded-sm bg-primary-50 p-[.6rem] px-3">
          <p className="font-light">Available Licenses:</p>
          <p>{licenseDetails?.available ?? 0}</p>
        </div>
      </div>

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
