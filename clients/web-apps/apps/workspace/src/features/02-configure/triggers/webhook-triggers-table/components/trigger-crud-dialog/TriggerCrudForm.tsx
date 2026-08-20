import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  InputField,
  SwitchField,
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { JsonEditorField } from "@/components/json-editor/JsonEditorField.tsx";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis.ts";
import {
  callbackUrlProps,
  idProps,
  isDisabledProps,
  nameProps,
  webhookUrlProps,
} from "../../constants/trigger-form-field-props.ts";
import { triggerZodSchema } from "../../constants/trigger-zod-schema.ts";
import { WebhookTriggerDto } from "../../dtos/webhook-trigger-dto.ts";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm.ts";
import { useTableTab } from "../../hooks/useTableTab.ts";
import { AgentsSelector } from "./AgentsSelector.tsx";
import InputWithCopy from "./InputWithCopy.tsx";

interface TriggerCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const TriggerCrudForm = ({ rowId, crudAction }: TriggerCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define trigger form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
    queryClient,
    objectToArray,
  } = useDefineTriggerForm({ rowId, crudAction });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the trigger
  const {
    mutate: mutateTrigger,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<WebhookTriggerDto, WebhookTriggerDto | boolean, WebhookTriggerDto>(
    [rowId],
    triggerOptimisticMutationFn,
    queryKey,
  );

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutateTrigger({
      payload: refineFormData(formData) as unknown as WebhookTriggerDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating/updating the record
    if (crudAction == "read") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "update" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Fetch trigger data when rowId changes
  useEffect(() => {
    if (crudAction !== "create" || !isSuccess) return;
    // Get triggers data from query client
    const triggersData = queryClient.getQueryData<{
      data: WebhookTriggerDto[];
    }>(queryKey);

    // Find the trigger by rowId
    const triggerData = triggersData?.data[0];

    if (triggerData) {
      // Reset form with fetched trigger data
      form.reset({
        id: triggerData?.id,
        name: triggerData?.name ?? "",
        agent: triggerData?.agent ? objectToArray(triggerData?.agent) : [],
        webhookUrl:
          triggerData?.webhookUrl ??
          `${window.location.origin}${import.meta.env.VITE_WORKSPACE_API_PATH}/execute-flow/webhook`,

        callbackUrl: triggerData?.callbackUrl ?? "",
        expectedPayloadSchema: triggerData?.expectedPayloadSchema ?? "",
        isDisabled: triggerData?.isDisabled ?? false,
      });
    }
  }, [isSuccess]);

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      // disabled={isReadMode}
    >
      {/* trigger Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        disabled={crudAction !== "create"}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
      />
      <Controller
        control={form.control}
        name="webhookUrl"
        render={({ field }) => (
          <InputWithCopy {...webhookUrlProps} value={field.value} onChange={field.onChange} />
        )}
      />

      {/* Agents Selector */}
      <FormField
        name="agent"
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
                disabled={isReadMode}
              />
            </FormControl>

            <FormMessage size={"base"} />
          </FormItem>
        )}
      />

      <InputField {...callbackUrlProps} disabled={isReadMode} />
      <pre>
        <JsonEditorField name="inputSchema" label="Input Arguments Schema" disabled={isReadMode} />
      </pre>

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField size="sm" disabled={isReadMode} {...isDisabledProps} />
      )}

      {/* Submit button */}
      {!isReadMode && !isSuccess && (
        <div className="!mt-10 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
