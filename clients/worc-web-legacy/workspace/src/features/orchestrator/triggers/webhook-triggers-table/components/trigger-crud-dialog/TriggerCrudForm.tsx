import { JsonEditorField } from "@/components/json-editor/JsonEditorField.tsx";

import { SubmitButton } from "@aventisia/ui/buttons";
import {
  DatePickerField,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  InputField,
  SelectField,
  SwitchField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis.ts";
import { DATA_QUERY_KEY } from "../../constants/index.ts";
import {
  expiryDateTimeProps,
  folderProps,
  idProps,
  isDisabledProps,
  nameProps,
  resubscribeFrequencyProps,
} from "../../constants/trigger-form-field-props.ts";
import { triggerZodSchema } from "../../constants/trigger-zod-schema.ts";
import { EmailTriggerDto } from "../../dtos/email-trigger-dto.ts";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm.ts";
import APIKeyField from "./APIKeyField.tsx";
import { AgentsSelector } from "./AgentsSelector.tsx";
import InputWithCopy from "./InputWithCopy.tsx";

// import { generateApiKey } from "../../apis/api-key-apis.ts";

export const TriggerCrudForm = () => {
  // Define trigger form
  const {
    form,
    rowId,
    isDirty,
    crudAction,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineTriggerForm();

  // Define optimistic mutation to crete or update the trigger
  const {
    mutate: mutateTrigger,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    EmailTriggerDto,
    EmailTriggerDto | boolean,
    EmailTriggerDto
  >([rowId], triggerOptimisticMutationFn, DATA_QUERY_KEY);

  const resubscribeFrequency = form.watch("resubscribeFrequency");
  const resubscribeFrequencyCustom = form.watch("resubscribeFrequencyCustom");

  useEffect(() => {
    const baseDate = new Date();

    const freq =
      resubscribeFrequency === "custom"
        ? Number(resubscribeFrequencyCustom)
        : Number(resubscribeFrequency);

    if (!freq || isNaN(freq)) return;

    baseDate.setDate(baseDate.getDate() + freq);

    form.setValue("expiryDateTime", baseDate);
  }, [resubscribeFrequency, resubscribeFrequencyCustom]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutateTrigger({
      payload: refineFormData(formData) as unknown as EmailTriggerDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating/updating the record
    if (crudAction == "read") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if ((crudAction === "create" || crudAction === "update") && isSuccess)
      setShowDialog(false);
  }, [isSuccess, crudAction, setShowDialog]);

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
      {/* trigger Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />
      <InputWithCopy value={`/webhook/${form.getValues("id")}`} />

      <Controller
        control={form.control}
        name="credentialId"
        render={({ field }) => (
          <APIKeyField value={field.value} onChange={field.onChange} />
        )}
      />
      <SelectField {...resubscribeFrequencyProps} />

      {resubscribeFrequency == "custom" && (
        <InputField
          name="resubscribeFrequencyCustom"
          label="Custom Expiry (in days)"
        />
      )}
      <DatePickerField {...expiryDateTimeProps} disabled />
      {/* Agents Selector */}
      <FormField
        name="agents"
        control={form.control}
        render={({ field }) => (
          <FormItem size={"base"}>
            <FormLabelExt
              size={"base"}
              label="Select Agent"
              description="Choose the agent that should be triggered by this event."
              isRequired
            />

            <FormControl>
              <AgentsSelector
                value={field.value ?? []}
                onChange={field.onChange}
                id={rowId}
                crudAction={crudAction}
              />
            </FormControl>

            <FormMessage size={"base"} />
          </FormItem>
        )}
      />

      <InputField {...folderProps} />
      <pre>
        <JsonEditorField
          name="inputSchema"
          label="Input Arguments Schema"
          disabled={isReadMode}
        />
      </pre>

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField size="sm" {...isDisabledProps} />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText={
              crudAction === "create" ? "Creating..." : "Saving..."
            }
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
