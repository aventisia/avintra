import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { Form } from "@/react-toolkit/ui/form/Form";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";
import { z } from "zod";
import {
  agentsProps,
  hostnameProps,
  idProps,
  ipAddressProps,
  nameProps,
  typeEnvironmentProps,
  typeProps,
  typeStatusProps,
} from "../../constants/machine-form-field-props";
import { machineFlowZodSchema } from "../../constants/machine-flow-zod-schema";
import { useFetchAgents } from "../../hooks/useFetchAgents";
import { MultiSelectField } from "@/react-toolkit/ui/form/fields/MultiSelectField";
import { useMutation } from "@tanstack/react-query";
import { useDefineMachineAssignAgentForm } from "../../hooks/useDefineMachineAssignAgentForm";
import { assignAgents } from "../../apis/machine-apis";
import { toast } from "sonner";
import type { AssignAgentDto } from "../../dtos/assign-agent-dto";

export const MachineFlowCrudForm = () => {
  // Define machine form
  const { form, isDirty, setShowDialog, refineFormData } =
    useDefineMachineAssignAgentForm();

  const { data: agents } = useFetchAgents();

  // Define mutation to update email of account
  const { mutate: mutateMachine, isPending } = useMutation({
    mutationFn: assignAgents,
    onSuccess: (data) => {
      toast.success(data.message);
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(error.toString());
      setShowDialog(true);
    },
    onSettled: () => {
      setShowDialog(false);
    },
  });

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof machineFlowZodSchema>) => {
    // Create or update the machine
    console.log(formData);

    mutateMachine(refineFormData(formData) as unknown as AssignAgentDto);

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
      {/* Agents */}
      <MultiSelectField {...agentsProps} selectOptions={agents?.data || []} />

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
        <Button
          type="submit"
          disabled={!isDirty || isPending}
          className="min-w-[5rem]"
        >
          Assign
        </Button>
      </div>
    </Form>
  );
};
