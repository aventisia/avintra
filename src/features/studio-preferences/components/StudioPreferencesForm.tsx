import { Form } from "@/react-toolkit/ui/form/Form";
import { RadioGroupField } from "@/react-toolkit/ui/form/fields/RadioGroupField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Separator } from "@/react-toolkit/ui/separator";
import { useCallback, useEffect } from "react";
import { z } from "zod";
import {
  disableDeleteAlertProps,
  hideIntractivityToggleProps,
  hideMiniMapProps,
  hideUndoRedoProps,
  hideZoomControlsProps,
  layoutDirectionProps,
} from "../constants/studio-preferences-form-field-props";
import { studioPreferencesZodSchema } from "../constants/studio-preferences-zod-schema";
import { useDefineStudioPreferencesForm } from "../hooks/useDefineStudioPreferencesForm";
import { setStudioPreferencesLocally } from "../utils/set-studio-preferences-locally";

export const StudioPreferencesForm = () => {
  // Define form
  const { form, setStudioPreferences } = useDefineStudioPreferencesForm();

  // Define submit handler
  const onSubmit = useCallback(
    (formData: z.infer<typeof studioPreferencesZodSchema>) => {
      // Set the studio preferences in store
      setStudioPreferences(formData);

      // Set the studio preferences in local storage
      setStudioPreferencesLocally(formData);
    },
    [setStudioPreferences],
  );

  // Use useEffect to submit form on value change
  useEffect(() => {
    const subscription = form.watch(() => {
      form.handleSubmit(onSubmit)();
    });
    return () => subscription.unsubscribe();
  }, [form, onSubmit]);

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-[1rem] px-2.5"
      checkDirtyForm={false}
    >
      <RadioGroupField {...layoutDirectionProps} />
      <div className="space-y-1">
        <Separator className="h-[0.5px]" />
        <SwitchField {...hideMiniMapProps} />
        <Separator className="h-[0.5px]" />
        <SwitchField {...hideUndoRedoProps} />
        <Separator className="h-[0.5px]" />
        <SwitchField {...hideIntractivityToggleProps} />
        <Separator className="h-[0.5px]" />
        <SwitchField {...hideZoomControlsProps} />
        <Separator className="h-[0.5px]" />
        <SwitchField {...disableDeleteAlertProps} />
      </div>
    </Form>
  );
};
