import { Separator } from "@avplatform/ui";
import { Form, RadioGroupField, SwitchField } from "@avplatform/ui/form";
import { useCallback, useEffect } from "react";
import { z } from "zod";

import {
  cursorToggleProps,
  deleteAlertProps,
  layoutDirectionProps,
  miniMapProps,
  zoomControlsProps,
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
    // <Form
    //   methods={form}
    //   onSubmit={form.handleSubmit(onSubmit)}
    //   className="space-y-[1rem] px-2.5"
    //   checkDirtyForm={false}
    // >
    //   <RadioGroupField {...layoutDirectionProps} />
    //   <div className="space-y-1">
    //     <Separator className="h-[0.5px]" />
    //     <SwitchField {...miniMapProps} />
    //     <Separator className="h-[0.5px]" />
    //     <SwitchField {...undoRedoProps} />
    //     <Separator className="h-[0.5px]" />
    //     <SwitchField {...cursorToggleProps} />
    //     <Separator className="h-[0.5px]" />
    //     <SwitchField {...zoomControlsProps} />
    //     <Separator className="h-[0.5px]" />
    //     <SwitchField {...deleteAlertProps} />
    //   </div>
    // </Form>
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-[0rem] px-2.5"
      checkDirtyForm={false}
    >
      <div className="hidden">
        <RadioGroupField {...layoutDirectionProps} />
      </div>
      <SwitchField {...miniMapProps} />
      <Separator className="h-[0.5px]" />
      <SwitchField {...cursorToggleProps} />
      <Separator className="h-[0.5px]" />
      <SwitchField {...zoomControlsProps} />
      <Separator className="h-[0.5px]" />
      <SwitchField {...deleteAlertProps} />
    </Form>
  );
};
