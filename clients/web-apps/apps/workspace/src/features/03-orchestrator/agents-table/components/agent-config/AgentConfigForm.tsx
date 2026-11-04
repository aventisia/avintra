import { Form, InputField, crudDialogFieldClasses } from "@avplatform/ui/form";
import { IconTile } from "@avplatform/ui/icon-tile";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import { z } from "zod";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import { agentConfigZodSchema } from "../../constants/agent-config-zod-schema";
import { useDefineAgentConfigForm } from "../../hooks/agent-config/useDefineAgentConfigForm";
import { useUpdateAgentConfig } from "../../hooks/agent-config/useUpdateAgentConfig";

/**
 * Card dialog that edits an agent's execution settings.
 */
export const AgentConfigForm = () => {
  const { form, isDirty, isSubmitting, flowVersionId, setShowDialog } = useDefineAgentConfigForm();

  const { updateFlowSettings, isPending } = useUpdateAgentConfig();

  const onSubmit = (formData: z.infer<typeof agentConfigZodSchema>) => {
    updateFlowSettings({
      versionId: flowVersionId,
      payload: formData,
    });

    setShowDialog(false);
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <CardDialog
      isOpen
      onClose={() => setShowDialog(false)}
      isDismissLocked={isPending}
      isOutsideClickLocked={isDirty}
      mark={
        <IconTile
          Icon={SlidersHorizontalIcon}
          size="lg"
          className="size-12 rounded-lg [&>svg]:size-6"
        />
      }
      eyebrow="Agent config"
      title="Execution settings"
      footer={
        <>
          <StatusLine tone={isDirty ? "pending" : "idle"}>
            {isDirty ? "Unsaved changes" : "No changes yet"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={() => setShowDialog(false)} disabled={isPending}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              onClick={handleSubmit}
              disabled={!isDirty || isSubmitting || isPending}
              isBusy={isPending}
            >
              {isPending ? "Saving" : "Save changes"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <Form methods={form} onSubmit={handleSubmit} disabled={isPending}>
        <InputField
          name="maxExecutionTimeInMinutes"
          label="Max execution time (in minutes)"
          description="The maximum time an agent is expected to run before it can be safely terminated."
          type="number"
          className={crudDialogFieldClasses.input}
          data-autofocus
        />
      </Form>
    </CardDialog>
  );
};
