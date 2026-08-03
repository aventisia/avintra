import { TagInput } from "@avplatform/ui";
import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
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
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { type CrudActionType } from "@avplatform/ui/types";
import { useEffect } from "react";
import { z } from "zod";

import { MultiSelectField } from "@/components/multi-select/MultiSelectField";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { timezoneOptions } from "../../constants/form-utils";
import {
  effectiveDateProps,
  endDateProps,
  exceptionHoursProps,
  exceptionWeekdaysProps,
  idProps,
  isDisabledProps,
  nameProps,
  selectFrequencyProps,
} from "../../constants/trigger-form-field-props";
import { triggerZodSchema } from "../../constants/trigger-zod-schema";
import { TimeTriggerDto } from "../../dtos/time-trigger-dto";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm";
import { useTableTab } from "../../hooks/useTableTab";
import { AgentsSelector } from "./AgentsSelector";
import { TimezoneSelector } from "./TimezoneSelector";
import { TriggerTimeScheduleInputs } from "./TriggerTimeScheduleInputs";

interface TriggerCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const TriggerCrudForm = ({ rowId, crudAction }: TriggerCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define trigger form
  const { form, isDirty, refineFormData, isEffectivePassed } = useDefineTriggerForm({
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

  // Is form in read mode?
  const isReadMode = crudAction === "read";
  // Lock the effective date fields if we're purely reading OR if it's an update where the date already passed
  const disableEffectiveInputs = isReadMode || (crudAction === "update" && isEffectivePassed);

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
      <InputField {...nameProps} />

      <FormField
        name="timezone"
        control={form.control}
        render={({ field }) => (
          <FormItem size={"base"}>
            <FormLabelExt
              size={"base"}
              label="Timezone"
              description="Select the timezone for the trigger."
              isRequired
            />
            <FormControl>
              <TimezoneSelector
                options={timezoneOptions}
                selectedItem={timezoneOptions.find((val) => val.value == field.value) || null}
                onItemSelect={(item) => field.onChange(item.value)}
                onItemClear={() => field.onChange(null)}
                placeholder="Search"
              />
            </FormControl>

            <FormMessage size={"base"} />
          </FormItem>
        )}
      />

      <SelectField {...selectFrequencyProps} />
      <div className={cn(frequency !== "OneTime" && "grid grid-cols-2 gap-2")}>
        <TriggerTimeScheduleInputs frequency={frequency} />
      </div>

      {/* Agents Selector */}
      <FormField
        name="agents"
        control={form.control}
        render={({ field }) => (
          <FormItem size={"base"}>
            <FormLabelExt
              size={"base"}
              label="Select Agent(s)"
              description="Choose the agent(s) that should be triggered by this event."
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

      <div className="grid grid-cols-2 gap-2">
        <DateTimePickerField
          {...effectiveDateProps}
          hourCycle={12}
          granularity="minute"
          disabled={disableEffectiveInputs}
        />
        <DateTimePickerField {...endDateProps} hourCycle={12} granularity="minute" />
      </div>

      <MultiSelectField {...exceptionHoursProps} />

      <MultiSelectField {...exceptionWeekdaysProps} />
      <FormField
        name="exceptionDates"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabelExt
              label="Exception Dates"
              description="Dates to exclude for triggers. Please enter date in format (YYYY-MM-DD)"
            />
            <FormControl>
              <TagInput
                {...field}
                value={field.value?.map((v) => v.toString()) ?? []}
                onChange={field.onChange}
                placeholder=""
                className="!shadow-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
            isPending={isPending}
            disabled={!isDirty}
          />
        </div>
      )}
    </Form>
  );
};
