import { Button } from "@aventisia/ui/buttons";
import {
  AutherCard,
  Form,
  InputField,
  SelectField,
  SwitchField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { cn } from "@aventisia/ui/lib";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { DateTimePickerField } from "@/react-toolkit/ui/form/fields/DateTimePickerField";
import { TimePickerField } from "@/react-toolkit/ui/form/fields/TimePickerField";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import {
  environmentTypeProps,
  idProps,
  isDisabledProps,
  nameProps,
  nonWorkingDays,
  scheduleEnding,
  scheduleNonWorkingDays,
  scheduleNonWorkingTimeRange,
  selectFrequencyProps,
  selectTimeZoneProps,
  trigerForNewItem,
  trigerFornNewEmail,
} from "../../constants/trigger-form-field-props";
import { triggerZodSchema } from "../../constants/trigger-zod-schema";
import { TriggersTableDto } from "../../dtos/triggers-table-dto";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm";
import { useAgentsSelectTableStore } from "../../stores/agents-select-table-store";

import { AgentSelectTable } from "./agents-select-table/AgentSelectTable";
import { TriggerTimeScheduleInputs } from "./TriggerTimeScheduleInputs";

export const TriggerCrudForm = () => {
  // Define trigger form
  const {
    form,
    isDirty,
    rowId,
    crudAction,
    isAvailable,
    isFetching,
    isLoading,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineTriggerForm();

  const { currentAgents } = useAgentsSelectTableStore(
    useShallow((state) => ({
      currentAgents: state.currentAgents,
      setAvailableLicenses: state.setAvailableLicenses,
    })),
  );

  // Define optimistic mutation to crete or update the trigger
  const { mutate: mutatetrigger } = useListOptimisticMutation<
    TriggersTableDto,
    TriggersTableDto | boolean,
    TriggersTableDto
  >([rowId], triggerOptimisticMutationFn, DATA_QUERY_KEY);

  const [
    frequency,
    sheduleEnding,
    isScheduleNonWorkingDays,
    isScheduleRetristredTimeZone,
  ] = form.watch([
    "frequency",
    "isEnds",
    "hasNonWorkingDays",
    "hasNonWorkingTime",
  ]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    const payload = {
      ...(refineFormData(formData) as unknown as TriggersTableDto),
      agentIds: currentAgents?.filter((x) => x.isAssigned).map((m) => m.id),
    };

    // Create or update the trigger
    mutatetrigger({
      payload: payload,
      crudAction: crudAction,
    });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    setShowDialog(false);
  };

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
      <SelectField {...environmentTypeProps} />

      <div className="!my-4 h-fit w-auto">
        <AgentSelectTable
          isFetching={isFetching || isLoading}
          isReadMode={isReadMode}
        />
      </div>

      <div className="gap-2">
        <span className="group flex flex-col gap-2">
          <AsyncSelectField {...selectTimeZoneProps} />
          <DateTimePickerField name="startsOn" label="Starts on" isRequired />
        </span>

        <div
          className={cn(
            "group mt-2 flex flex-col gap-2 space-y-2",
            frequency && frequency != "OneTime" && "my-2 rounded-lg border p-2",
          )}
        >
          <SelectField {...selectFrequencyProps} />
          <TriggerTimeScheduleInputs frequency={frequency} />
        </div>

        <div
          className={cn(
            isScheduleNonWorkingDays && "my-2 rounded-lg border p-2",
          )}
        >
          <SwitchField
            {...scheduleNonWorkingDays}
            className={cn(isScheduleNonWorkingDays && "px-0")}
          />
          {isScheduleNonWorkingDays && (
            <DateTimePickerField {...nonWorkingDays} />
          )}
        </div>

        <div
          className={cn(
            isScheduleRetristredTimeZone && "my-2 rounded-lg border p-2",
          )}
        >
          <SwitchField
            {...scheduleNonWorkingTimeRange}
            className={cn(isScheduleRetristredTimeZone && "px-0")}
          />
          {isScheduleRetristredTimeZone && (
            <div className="group flex justify-evenly gap-4">
              <TimePickerField
                isRequired
                name="nonWorkingTimeFrom"
                label="From"
              />
              <TimePickerField isRequired name="nonWorkingTimeTo" label="To" />
            </div>
          )}
        </div>

        <div className={cn(sheduleEnding && "rounded-lg border p-2")}>
          <SwitchField
            {...scheduleEnding}
            className={cn(sheduleEnding && "px-0")}
          />
          {sheduleEnding && (
            <DateTimePickerField name="endsOn" label="Ends on" isRequired />
          )}
        </div>

        <SwitchField {...trigerForNewItem} />
        <SwitchField {...trigerFornNewEmail} />

        {/* <SwitchField {...scheduleAutoDisabling} />
        <SwitchField {...generateStuckAlert} />
        <SwitchField {...generateFailedAlert} /> */}
      </div>
      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isAvailable || isCheckPending}
            className="min-w-[5rem]"
          >
            {crudAction === "create" ? "Create" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
