import { useEffect, useState } from "react";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { getLicense } from "@/features/orchestrator/licenses-table/apis/licenses-table-apis";
import { MyLicensesTableDto } from "@/features/orchestrator/licenses-table/dtos/licenses-table-dto";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { Separator } from "@/react-toolkit/ui/separator";

import { machineOptimisticMutationFn } from "../../apis/machines-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  environmentTypeProps,
  hostnameProps,
  idProps,
  ipAddressProps,
  isDisabledProps,
  licenseSelectProps,
  nameProps,
  osTypeProps,
} from "../../constants/machine-form-field-props";
import { machineZodSchema } from "../../constants/machine-zod-schema";
import { MachinesTableDto } from "../../dtos/machines-table-dto";
import { useDefineMachineForm } from "../../hooks/useDefineMachineForm";
import { useAgentsSelectTableStore } from "../../stores/agents-select-table-store";
import { AddedByAutherCard } from "./AddedByAutherCard";
import { AgentSelectTable } from "./agents-select-table/AgentSelectTable";

export const MachineCrudForm = () => {
  // Define machine form
  const {
    form,
    //TODO - isDirty state whenever the assign agent select table changes
    // Select agents table is not updating the selection on edit machine.
    // isDirty,
    rowId,
    crudAction,
    isAvailable,
    availabilityMessage,
    isFetching,
    isLoading,
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

  const [licenseDetails, setLicenseDetails] = useState<MyLicensesTableDto>();

  // Get store state and actions
  const { currentAgents, setAvailableLicenses } = useAgentsSelectTableStore(
    useShallow((state) => ({
      currentAgents: state.currentAgents,
      setAvailableLicenses: state.setAvailableLicenses,
    })),
  );

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineZodSchema>) => {
    const payload = {
      ...(refineFormData(formData) as unknown as MachinesTableDto),
      agentIds: currentAgents?.filter((x) => x.isAssigned).map((m) => m.id),
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

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
    >
      {/* Machine Id */}
      {isReadMode && <InputField {...idProps} disabled={isReadMode} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={isReadMode}
      />

      <div className="grid grid-cols-2 gap-2">
        {/* os type */}
        {crudAction === "create" ? (
          <SelectField {...osTypeProps} disabled={isReadMode} />
        ) : (
          form.getValues("type") !== "" && (
            <SelectField {...osTypeProps} disabled={isReadMode} />
          )
        )}

        {/* Ip Address */}
        <InputField {...ipAddressProps} disabled={isReadMode} />
      </div>

      {/* Host Name */}
      <InputField {...hostnameProps} disabled={isReadMode} />

      {/* environment */}
      {form.getValues("environment") !== "" && (
        <SelectField {...environmentTypeProps} disabled={isReadMode} />
      )}

      <Separator className="!my-6" />

      <div className="flex flex-col gap-4">
        {/* license type */}
        <AsyncSelectField {...licenseSelectProps} />
        <div className="flex flex-row justify-between rounded-sm bg-primary-50 p-[.6rem] px-3">
          <p className="font-light">Available Licenses:</p>
          <p>{licenseDetails?.available ?? 0}</p>
        </div>
      </div>

      <div className="!mt-4 h-fit w-[30rem]">
        <AgentSelectTable
          isFetching={isFetching || isLoading}
          isReadMode={isReadMode}
        />
      </div>

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField {...isDisabledProps} disabled={isReadMode} />
      )}

      {/* AutherCard */}
      {isReadMode && (
        <AddedByAutherCard
          addedBy={form.getValues("createdBy")}
          addedOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-12 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Add" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
