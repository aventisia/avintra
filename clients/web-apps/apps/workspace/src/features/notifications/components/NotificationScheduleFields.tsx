import { DateTimePickerField } from "@avplatform/ui/components/form/fields/DateTimePickerField";
import { NotificationRecurrenceEnum } from "@avplatform/ui/enums";
import { MultiSelectField, SelectField } from "@avplatform/ui/form";
import { useWatch } from "react-hook-form";

import {
  MONTH_DAY_OPTIONS,
  RECURRENCE_OPTIONS,
  WEEKDAY_OPTIONS,
} from "../constants/notification-form-options.constant";

/**
 * Send time and recurrence fields shared by the notification compose forms.
 */
export const NotificationScheduleFields = () => {
  const recurrenceFrequency = useWatch({ name: "recurrenceFrequency" });

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <DateTimePickerField
          name="scheduledFor"
          label="Send at"
          description="Leave empty to send immediately."
        />
        <SelectField
          name="recurrenceFrequency"
          label="Repeat"
          selectOptions={RECURRENCE_OPTIONS}
          placeholder="Select recurrence"
          description="How often this notification repeats."
        />
      </div>

      {recurrenceFrequency === NotificationRecurrenceEnum.Weekly && (
        <MultiSelectField
          name="recurrenceWeekdays"
          label="Weekdays"
          selectOptions={WEEKDAY_OPTIONS}
          placeholder="Select weekdays"
          description="Days of the week on which this notification recurs."
        />
      )}

      {recurrenceFrequency === NotificationRecurrenceEnum.Monthly && (
        <MultiSelectField
          name="recurrenceMonthDays"
          label="Days of month"
          selectOptions={MONTH_DAY_OPTIONS}
          placeholder="Select days"
          description="Days of the month on which this notification recurs."
        />
      )}

      {recurrenceFrequency && recurrenceFrequency !== NotificationRecurrenceEnum.None && (
        <DateTimePickerField
          name="recurrenceEndOn"
          label="End repeat on"
          description="The date after which this recurring notification stops."
        />
      )}
    </>
  );
};
