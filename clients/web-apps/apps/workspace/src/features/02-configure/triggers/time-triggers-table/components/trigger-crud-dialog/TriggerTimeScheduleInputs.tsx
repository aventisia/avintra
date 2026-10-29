import { InputField, SelectField } from "@avplatform/ui/form";

import { MultiSelectField } from "@/components/multi-select/MultiSelectField";
import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

import {
  generateDayOfMonthOptions,
  generateDayOfWeekOptions,
  generateHourMinutesOptions,
  generateHourlyOptions,
  generateMinutesOptions,
  generateMonthOptions,
} from "../../constants/form-utils";

export const TriggerTimeScheduleInputs = ({ frequency }: { frequency?: string }) => {
  const frequencyKey = frequency as keyof typeof TriggerFrequencyTypesEnum;

  // Switch statement for rendering specific frequency input fields
  switch (frequencyKey) {
    case "MinuteByMinute":
      return (
        <SelectField
          name="interval"
          isRequired
          label={"Repeat every (minutes)"}
          description="Select the interval in minutes for repeating the trigger."
          selectOptions={generateMinutesOptions()}
        />
      );
    case "Hourly":
      return (
        <>
          <SelectField
            name="interval"
            isRequired
            label={"Repeat every (hours)"}
            description="Select the interval in hours for repeating the trigger."
            selectOptions={generateHourlyOptions()}
          />

          <SelectField
            name="atTime"
            label={"Minutes"}
            description="Select the specific minute when the trigger should occur."
            selectOptions={generateHourMinutesOptions()}
          />
        </>
      );
    case "Daily":
      return (
        <>
          <SelectField
            name="interval"
            isRequired
            label={"Repeat every (N day)"}
            description="Choose the day of the month for repeating the trigger."
            selectOptions={generateDayOfMonthOptions()}
          />
          <InputField
            type="time"
            className="w-full"
            label="Time"
            name="atTime"
            description="Select the time of day when the trigger should occur."
            defaultValue={"00:00"}
            step={60}
          />
        </>
      );
    case "Weekly":
      return (
        <>
          <MultiSelectField
            name="weekdays"
            label="Repeat every (week)"
            isRequired
            description="Select the weekdays for repeating the trigger."
            selectOptions={generateDayOfWeekOptions()}
          />
          <InputField
            type="time"
            className="w-full flex-grow"
            label="Time"
            name="atTime"
            defaultValue={"00:00"}
            description="Choose the time of day when the trigger should occur."
            step={60}
          />
        </>
      );
    case "MonthlyDayOfMonth":
      return (
        <>
          <SelectField
            name="interval"
            label="Repeat every (month)"
            isRequired
            description="Choose the months for repeating the trigger."
            selectOptions={generateMonthOptions()}
          />
          <InputField
            type="time"
            className="w-full flex-grow"
            label="Time"
            name="atTime"
            defaultValue={"00:00"}
            step={60}
            description="Specify the time of day when the trigger should execute."
          />
          <MultiSelectField
            name="monthDays"
            label="Day(s) of the month"
            isRequired
            description="Select the specific days of the month for triggering."
            selectOptions={generateDayOfMonthOptions()}
          />
        </>
      );
    default:
      return null;
  }
};
