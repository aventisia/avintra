import { InputField, MultiSelectField, SelectField } from "@aventisia/ui/form";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

import {
  generateDayOfMonthOptions,
  generateDayOfWeekOptions,
  generateHourlyOptions,
  generateHourMinutesOptions,
  generateMinutesOptions,
  generateMonthOptions,
} from "../../constants/form-utils";

export const TriggerTimeScheduleInputs = ({
  frequency,
}: {
  frequency?: string;
}) => {
  const frequencyKey = frequency as keyof typeof TriggerFrequencyTypesEnum;

  // Switch statement for rendering specific frequency input fields
  switch (frequencyKey) {
    case "MinuteByMinute":
      return (
        <SelectField
          name="interval"
          isRequired
          label={"Repeat Every (Minutes)"}
          selectOptions={generateMinutesOptions()}
        />
      );
    case "Hourly":
      return (
        <>
          <SelectField
            name="interval"
            isRequired
            label={"Repeat Every (Hours)"}
            selectOptions={generateHourlyOptions()}
          />

          <SelectField
            name="atTime"
            label={"Minutes"}
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
            label={"Repeat Every (Days of Month)"}
            selectOptions={generateDayOfMonthOptions()}
          />
          <InputField
            type="time"
            className="w-full"
            label="Time"
            name="atTime"
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
            label="Repeat Every (Week)"
            isRequired
            selectOptions={generateDayOfWeekOptions()}
          />
          <InputField
            type="time"
            className="w-full flex-grow"
            label="Time"
            name="atTime"
            defaultValue={"00:00"}
            step={60}
          />
        </>
      );
    case "MonthlyDayOfMonth":
      return (
        <>
          <SelectField
            name="interval"
            label="Repeat Every (Month)"
            isRequired
            selectOptions={generateMonthOptions()}
          />
          <InputField
            type="time"
            className="w-full flex-grow"
            label="Time"
            name="atTime"
            defaultValue={"00:00"}
            step={60}
          />
          <MultiSelectField
            name="monthDays"
            label="Day(s) of the Month"
            isRequired
            selectOptions={generateDayOfMonthOptions()}
          />
        </>
      );
    default:
      return null;
  }
};
