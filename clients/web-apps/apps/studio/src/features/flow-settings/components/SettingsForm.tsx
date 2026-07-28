import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputField } from "@avplatform/ui/form";
import { useCallback } from "react";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

// import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

// import { PANEL_ID } from "../constants";
import { settingsZodSchema } from "../constants/settings-zod-schema";
import { useDefineSettingsForm } from "../hooks/useDefineSettingsForm";
import { useUpdateFlowVersionSetting } from "../hooks/useUpdateFlowVersionSetting";

export const SettingsForm = () => {
  // const { closePanel } = usePanelStore();

  // Define form
  const { form, isDirty, setSettings, isSubmitting } = useDefineSettingsForm();

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { updateFlowSettings, isPending } = useUpdateFlowVersionSetting();

  // Define submit handler
  const onSubmit = useCallback(
    (formData: z.infer<typeof settingsZodSchema>) => {
      // Set the settings in store
      updateFlowSettings({
        versionId: currentFlow.versionId,
        payload: formData,
      });

      setSettings(formData);
      // closePanel(PANEL_ID);
    },
    [],
  );

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
