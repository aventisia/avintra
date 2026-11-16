import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import {
  DateTimePickerField,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  InputField,
  SelectField,
  SwitchField,
  crudDialogFieldClasses,
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { ISelectOption } from "@avplatform/ui/types";
import {
  applyTimeZoneOffset,
  getTimezoneOptions,
  removeTimeZoneOffset,
} from "@avplatform/ui/utils/timezone-utils";
import { useEffect, useState } from "react";
import { z } from "zod";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis.ts";
import { getVaultCredentialSelectOptions } from "../../apis/vault-credential-select.apis.ts";
import { resourceRequiresReference } from "../../constants/form-utils.ts";
import {
  LOCKED_AGENTS_DESCRIPTION,
  agentsLabelProps,
  credentialProps,
  expiryDateTimeProps,
  isDisabledProps,
  nameProps,
  providerProps,
  referenceProps,
  resourceProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
  timezoneLabelProps,
} from "../../constants/trigger-form-field-props.constant.ts";
import { triggerZodSchema } from "../../constants/trigger-zod-schema.ts";
import { MessageTriggerDto } from "../../dtos/message-trigger-dto.ts";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm.ts";
import { useTableTab } from "../../hooks/useTableTab.ts";
import { AgentsSelector } from "./AgentsSelector.tsx";
import { TimezoneSelector } from "./TimezoneSelector.tsx";

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
  } = useDefineTriggerForm({ rowId, crudAction });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the trigger
  const {
    mutate: mutateTrigger,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<MessageTriggerDto, MessageTriggerDto | boolean, MessageTriggerDto>(
    [rowId],
    triggerOptimisticMutationFn,
    queryKey,
  );

  const resubscribeFrequency = form.watch("resubscribeFrequency");
  const provider = form.watch("provider");

  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);

  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set loading state
    setLoading(true);

    // Fetch credentials list. Note: Every credential-field should have name ending with 'Credential'
    getVaultCredentialSelectOptions(provider)
      .then((data) => {
        setSelectOptions(data?.data as ISelectOption[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch ", err);
        setLoading(false);
      });
  }, [provider]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutateTrigger({
      payload: refineFormData(formData) as unknown as MessageTriggerDto,
      crudAction: crudAction,
    });
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);
  const timezone = form.watch("timezone");

  // sync expiry date with selected timezone
  useEffect(() => {
    const freq = Number(resubscribeFrequency);
    if (!freq || isNaN(freq) || !timezone) return;

    // 1. Get expiry date
    const currDate = form.getValues("expiryDateTime") || new Date();

    // 2. Convert to selected timezone
    const tzDate = applyTimeZoneOffset(currDate, timezone);

    // 3. Add minutes in THAT timezone
    tzDate.setMinutes(tzDate.getMinutes() + freq);

    // 4. (optional) convert back to UTC/system if needed
    const finalDate = removeTimeZoneOffset(tzDate, timezone);

    form.setValue("expiryDateTime", finalDate);
  }, [resubscribeFrequency, timezone]);

  const referenceRequired = resourceRequiresReference(form.watch("resource"));

  const isUpdateMode = crudAction === "update";

  const timezoneOptions = getTimezoneOptions();

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={isUpdateMode}
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField {...providerProps} disabled={isUpdateMode} />
        {(!isUpdateMode || form.getValues("credentialName") !== "") && (
          <SelectField
            {...credentialProps}
            selectOptions={selectOptions ?? []}
            disabled={isUpdateMode}
          />
        )}
      </div>

      <SelectField {...resourceProps} disabled={isUpdateMode} />
      {referenceRequired && <InputField {...referenceProps} disabled={isUpdateMode} />}

      <FormField
        name="timezone"
        control={form.control}
        render={({ field }) => (
          <FormItem className={crudDialogFieldClasses.item}>
            <FormLabelExt {...timezoneLabelProps} />
            <FormControl>
              <TimezoneSelector
                options={timezoneOptions}
                selectedItem={timezoneOptions.find((val) => val.value == field.value) || null}
                onItemSelect={(item) => field.onChange(item.value)}
                onItemClear={() => field.onChange(null)}
                placeholder="Search timezones"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <InputField type="number" {...resubscribeFrequencyProps} min={1} max={4320} />
        <DateTimePickerField {...expiryDateTimeProps} disabled />
      </div>

      <FormField
        name="agents"
        control={form.control}
        render={({ field }) => (
          <FormItem className={crudDialogFieldClasses.item}>
            <FormLabelExt
              {...agentsLabelProps}
              description={isUpdateMode ? LOCKED_AGENTS_DESCRIPTION : agentsLabelProps.description}
            />
            <FormControl>
              <AgentsSelector
                value={field.value ?? []}
                onChange={field.onChange}
                id={rowId}
                crudAction={crudAction}
                disabled={isUpdateMode}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SwitchField size="sm" {...resubscribeEnabledProps} />

      {isUpdateMode && <SwitchField size="sm" {...isDisabledProps} />}

      <CrudDialogActions>
        <SubmitButton
          className="min-w-[5rem]"
          primaryText={isUpdateMode ? "Save changes" : "Create trigger"}
          secondaryText={isUpdateMode ? "Saving..." : "Creating..."}
          isPending={isPending}
          disabled={!isDirty || !isAvailable || isCheckPending}
        />
      </CrudDialogActions>
    </Form>
  );
};
