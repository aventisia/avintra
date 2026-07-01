import { SubmitButton } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { z } from "zod";

import { agentConfigZodSchema } from "../../constants/agent-config-zod-schema";
import { useDefineAgentConfigForm } from "../../hooks/agent-config/useDefineAgentConfigForm";
import { useUpdateAgentConfig } from "../../hooks/agent-config/useUpdateAgentConfig";

export const AgentConfigForm = () => {
  // Define form
  const { form, isDirty, isSubmitting, flowVersionId, setShowDialog } =
    useDefineAgentConfigForm();

  const { updateFlowSettings, isPending } = useUpdateAgentConfig();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof agentConfigZodSchema>) => {
    // Set the settings in store
    updateFlowSettings({
      versionId: flowVersionId,
      payload: formData,
    });

    setShowDialog(false);
  };

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      checkDirtyForm={false}
      disabled={isPending}
    >
      <InputField
        name="maxExecutionTimeInMinutes"
        label="Max Execution Time (in minutes)"
        description="The maximum time an agent is expected to run before it can be safely terminated."
        type="number"
      />

      <div className="flex w-full items-center justify-end pb-4">
        <SubmitButton
          size="sm"
          disabled={!isDirty}
          isPending={isSubmitting || isPending}
          primaryText="Save"
          secondaryText="Saving"
        />
      </div>
    </Form>
  );
};
