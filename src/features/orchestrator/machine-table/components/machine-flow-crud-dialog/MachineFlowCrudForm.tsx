import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import { machineFlowOptimisticMutationFn } from "../../apis/machine-flow-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  agentProps,
  hostnameProps,
  idProps,
  ipAddressProps,
  nameProps,
  typeEnvironmentProps,
  typeProps,
  typeStatusProps,
} from "../../constants/machine-form-field-props";
import { MachineFlowDto } from "../../dtos/machine-flow-dto";
import { useDefineMachineFlowForm } from "../../hooks/useDefineMachineFlowForm";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { machineFlowZodSchema } from "../../constants/machine-flow-zod-schema";

export const MachineFlowCrudForm = () => {
  // Define machine form
  const { form, isDirty, machineId, setShowDialog, refineFormData } =
    useDefineMachineFlowForm();

  // const { data: agents } = useFetchAgents();

  // Define optimistic mutation to crete or update the machine
  const { mutate: mutateMachine } = useListOptimisticMutation<
    MachineFlowDto,
    MachineFlowDto | boolean,
    MachineFlowDto
  >([machineId], machineFlowOptimisticMutationFn, DATA_QUERY_KEY);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineFlowZodSchema>) => {
    // Create or update the machine
    mutateMachine({
      payload: refineFormData(formData) as unknown as MachineFlowDto,
      crudAction: "update",
    });

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
      {/* <MultiSelectField {...agentsProps} selectOptions={agents?.data || []} /> */}

      {/* Agents */}
      <SelectField {...agentProps} />

      <InputField {...idProps} />

      <InputField disabled={true} {...nameProps} />

      <InputField disabled={true} {...ipAddressProps} />

      <InputField disabled={true} {...hostnameProps} />

      <SelectField disabled={true} {...typeProps} />

      <SelectField disabled={true} {...typeEnvironmentProps} />

      <SelectField disabled={true} {...typeStatusProps} />

      <AutherCard
        createdBy={form.getValues("createdBy")}
        createdOn={form.getValues("createdOn")}
        lastModifiedBy={form.getValues("lastModifiedBy")}
        lastModifiedOn={form.getValues("lastModifiedOn")}
      />

      <div className="!mt-5 flex w-full justify-end">
        <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
          Assign
        </Button>
      </div>
    </Form>
  );
};
