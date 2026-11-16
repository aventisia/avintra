import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  InputField,
  SwitchField,
  crudDialogFieldClasses,
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { JsonEditorField } from "@/components/json-editor/JsonEditorField.tsx";
import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis.ts";
import {
  agentLabelProps,
  callbackUrlProps,
  inputSchemaLabelProps,
  isDisabledProps,
  nameProps,
  webhookUrlProps,
} from "../../constants/trigger-form-field-props.constant.ts";
import { triggerZodSchema } from "../../constants/trigger-zod-schema.constant.ts";
import { WebhookTriggerDto } from "../../dtos/webhook-trigger-dto.ts";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm.ts";
import { useTableTab } from "../../hooks/useTableTab.ts";
import { formatPayloadSchema } from "../../utils/format-payload-schema.util";
import { AgentsSelector } from "./AgentsSelector.tsx";
import InputWithCopy from "./InputWithCopy.tsx";

interface TriggerCrudFormProps {
  rowId: string;
  crudAction: "create" | "update";
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
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "update" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  const isUpdateMode = crudAction === "update";

  // Fetch trigger data when rowId changes
  useEffect(() => {
    if (crudAction !== "create" || !isSuccess) return;
    // Get triggers data from the merged Personal/Shared lists in the cache
    const triggersData = getMergedQueryData<WebhookTriggerDto>(queryClient, queryKey);

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
        expectedPayloadSchema: formatPayloadSchema(triggerData?.expectedPayloadSchema ?? ""),
        isDisabled: triggerData?.isDisabled ?? false,
      });
    }
  }, [isSuccess]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        {...nameProps}
        disabled={isUpdateMode}
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

      <InputField {...callbackUrlProps} />

      <JsonEditorField name="expectedPayloadSchema" {...inputSchemaLabelProps} />

      <FormField
        name="agent"
        control={form.control}
        render={({ field }) => (
          <FormItem className={crudDialogFieldClasses.item}>
            <FormLabelExt {...agentLabelProps} />
            <FormControl>
              <AgentsSelector
                value={field.value ?? []}
                onChange={field.onChange}
                id={rowId}
                crudAction={crudAction}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isUpdateMode && <SwitchField size="sm" {...isDisabledProps} />}

      {!isSuccess && (
        <CrudDialogActions>
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={isUpdateMode ? "Save changes" : "Create trigger"}
            secondaryText={isUpdateMode ? "Saving..." : "Creating..."}
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </CrudDialogActions>
      )}
    </Form>
  );
};
