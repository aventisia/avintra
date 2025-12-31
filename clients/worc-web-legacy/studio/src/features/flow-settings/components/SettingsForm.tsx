import { Form } from "@aventisia/ui/form";
import { useCallback } from "react";
import { z } from "zod";
import { useDefineSettingsForm } from "../hooks/useDefineSettingsForm";
import { settingsZodSchema } from "../constants/settings-zod-schema";
import { setSettingsLocally } from "../utils/set-settings-locally";
import { runDelayProps } from "../constants/settings-form-field-props";
import { SubmitButton } from "@aventisia/ui/buttons";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import { Controller } from "react-hook-form";
import { Input } from "@aventisia/ui";
import { PANEL_ID } from "../constants";

export const SettingsForm = () => {
  const { closePanel } = usePanelStore();
  // Define form
  const { form, setSettings, isDirty, isSubmitting } = useDefineSettingsForm();

  // Define submit handler
  const onSubmit = useCallback(
    (formData: z.infer<typeof settingsZodSchema>) => {
      // Set the settings in store
      setSettings(formData);

      // Set the settings in local storage
      setSettingsLocally(formData);

      closePanel(PANEL_ID);
    },
    [closePanel, setSettings],
  );

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-[1rem]"
      checkDirtyForm={false}
    >
      <Controller
        control={form.control}
        name="runDelay"
        render={({ field }) => (
          <Input
            {...runDelayProps}
            {...field}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />

      <div className="flex w-full items-center justify-end pb-4">
        <SubmitButton
          size="xs"
          disabled={!isDirty}
          isPending={isSubmitting}
          primaryText="Save"
        />
      </div>
    </Form>
  );
};
