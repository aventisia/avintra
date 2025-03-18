import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
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
import { AddedByAutherCard } from "./AddedByAutherCard";
import { useAgentsSelectTableStore } from "../../stores/agents-select-table-store";
import { useShallow } from "zustand/react/shallow";

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

  // Get store state and actions
  const { currentAgents } = useAgentsSelectTableStore(
    useShallow((state) => ({
      currentAgents: state.currentAgents,
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

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField {...isDisabledProps} disabled={isReadMode} />
      )}

      <div className="mt-2 h-fit w-[38rem]">
        <AgentSelectTable
          isFetching={isFetching || isLoading}
          isReadMode={isReadMode}
        />
      </div>

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
