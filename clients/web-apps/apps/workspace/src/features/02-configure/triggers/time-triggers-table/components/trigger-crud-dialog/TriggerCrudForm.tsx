import { TagInput } from "@avplatform/ui";
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
import { useEffect } from "react";
import { z } from "zod";

import { MultiSelectField } from "@/components/multi-select/MultiSelectField";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { timezoneOptions } from "../../constants/form-utils";
import {
  LOCKED_EFFECTIVE_DATE_DESCRIPTION,
  agentsLabelProps,
  effectiveDateProps,
  endDateProps,
  exceptionDatesLabelProps,
  exceptionHoursProps,
  exceptionWeekdaysProps,
  isDisabledProps,
  nameProps,
  selectFrequencyProps,
  timezoneLabelProps,
} from "../../constants/trigger-form-field-props.constant";
import { triggerZodSchema } from "../../constants/trigger-zod-schema";
import { TimeTriggerDto } from "../../dtos/time-trigger-dto";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm";
import { useTableTab } from "../../hooks/useTableTab";
import { AgentsSelector } from "./AgentsSelector";
import { TimezoneSelector } from "./TimezoneSelector";
import { TriggerTimeScheduleInputs } from "./TriggerTimeScheduleInputs";

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
    isEffectivePassed,
  } = useDefineTriggerForm({
    rowId,
    crudAction,
  });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the trigger
  const {
    mutate: mutateTrigger,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<TimeTriggerDto, TimeTriggerDto | boolean, TimeTriggerDto>(
    [rowId],
    triggerOptimisticMutationFn,
    queryKey,
  );

  const frequency = form.watch("frequency");

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutateTrigger({
      payload: refineFormData(formData) as unknown as TimeTriggerDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating the record
    if (crudAction !== "create") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  const isUpdateMode = crudAction === "update";

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        {...nameProps}
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={isUpdateMode}
      />

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

      <SelectField {...selectFrequencyProps} />
      <div className="grid grid-cols-2 gap-3">
        <TriggerTimeScheduleInputs frequency={frequency} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DateTimePickerField
          {...effectiveDateProps}
          description={
            isUpdateMode && isEffectivePassed
              ? LOCKED_EFFECTIVE_DATE_DESCRIPTION
              : effectiveDateProps.description
          }
          hourCycle={12}
          disabled={isUpdateMode && isEffectivePassed}
        />
        <DateTimePickerField {...endDateProps} hourCycle={12} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MultiSelectField {...exceptionHoursProps} />
        <MultiSelectField {...exceptionWeekdaysProps} />
      </div>

      <FormField
        name="exceptionDates"
        control={form.control}
        render={({ field }) => (
          <FormItem className={crudDialogFieldClasses.item}>
            <FormLabelExt {...exceptionDatesLabelProps} />
            <FormControl>
              <TagInput
                {...field}
                value={field.value?.map((v) => v.toString()) ?? []}
                onChange={field.onChange}
                placeholder="e.g. 2026-12-25"
                className="!shadow-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="agents"
        control={form.control}
        render={({ field }) => (
          <FormItem className={crudDialogFieldClasses.item}>
            <FormLabelExt {...agentsLabelProps} />
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
