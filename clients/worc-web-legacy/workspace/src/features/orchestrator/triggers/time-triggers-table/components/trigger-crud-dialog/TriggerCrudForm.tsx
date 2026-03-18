import { TagInput } from "@aventisia/ui";
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
import { cn } from "@aventisia/ui/lib";
import { useEffect } from "react";
import { z } from "zod";

import { MultiSelectField } from "@/components/multi-select/MultiSelectField";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
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

import { AgentsSelector } from "./AgentsSelector";
import { TimezoneSelector } from "./TimezoneSelector";
import { TriggerTimeScheduleInputs } from "./TriggerTimeScheduleInputs";

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
    TimeTriggerDto,
    TimeTriggerDto | boolean,
    TimeTriggerDto
  >([rowId], triggerOptimisticMutationFn, DATA_QUERY_KEY);

  const frequency = form.watch("frequency");

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutateTrigger({
      payload: refineFormData(formData) as unknown as TimeTriggerDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating the record
    if (crudAction !== "create") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if (crudAction === "create" && isSuccess) setShowDialog(false);
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
                selectedItem={
                  timezoneOptions.find((val) => val.value == field.value) ||
                  null
                }
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
        name="agentIds"
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
        <DatePickerField {...effectiveDateProps} />
        <InputField type="time" name="effectiveTime" step={60} label="Time" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <DatePickerField {...endDateProps} />
        <InputField type="time" name="endTime" step={60} label="Time" />
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
