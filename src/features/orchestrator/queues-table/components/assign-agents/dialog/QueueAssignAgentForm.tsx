import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { useOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { z } from "zod";

import { assignAgents } from "../../../apis/queues-table-apis";
import { queueAssignAgentsZodSchema } from "../../../constants/queue-zod-schema";
import { AssignAgentDto } from "../../../dtos/assign-agent-dto";
import { useDefineAssignAgentsForm } from "../../../hooks/useDefineAssignAgentsForm";
import { useAssignAgentsStore } from "../../../stores/assign-agents-store";
import { AgentSelectTable } from "../AgentSelectTable";

export const QueueAssignAgentForm = () => {
  // Define queue form
  const { form, isDirty, rowId, crudAction, setShowDialog, refineFormData } =
    useDefineAssignAgentsForm();

  // Define optimistic mutation to crete or update the queue
  const { mutate: mutatequeue } = useOptimisticMutation<
    AssignAgentDto,
    AssignAgentDto | boolean,
    AssignAgentDto
  >(assignAgents, ["assign-agents", rowId], undefined);

  useEffect(() => {
    useAssignAgentsStore.subscribe(
      (state) => state.currentAgents,
      (state) =>
        form.setValue(
          "agentIds",
          state.filter((x) => x.isAssigned).map((x) => x.id),
          {
            shouldDirty: true,
          },
        ),
    );
  }, []);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof queueAssignAgentsZodSchema>) => {
    // Create or update the queue
    mutatequeue(refineFormData(formData) as unknown as AssignAgentDto);

    // Close the dialog
    setShowDialog(false);
  };

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      <div className="my-4 h-fit">
        <AgentSelectTable />
      </div>

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            Assign Selected
          </Button>
        </div>
      )}
    </Form>
  );
};
