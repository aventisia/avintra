import { InputField, MultiSelectField } from "@aventisia/ui/form";
import { ISelectOption } from "@aventisia/ui/types";
import { enumToArray } from "@aventisia/ui/utils";
import Enumerable from "linq";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";
import { DayOfWeek } from "@/react-toolkit/enums/day-of-week-enum";
import { TimePickerField } from "@/react-toolkit/ui/form/fields/TimePickerField";

export const TriggerTimeScheduleInputs = ({
  frequency,
}: {
  frequency?: string;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.key;
    const currentValue = (e.target as HTMLInputElement).value;

    // Allow control keys
    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
    ) {
      return;
    }

    // Allow only digits
    if (!/^\d$/.test(input)) {
      e.preventDefault();
      return;
    }

    // Build new potential value
    const newValue = currentValue + input;

    // Parse number
    const num = parseInt(newValue);

    // Block values over 59 or less than 1
    if (num < 1 || num > 59) {
      e.preventDefault();
    }
  };

  switch (frequency as keyof typeof TriggerFrequencyTypesEnum) {
    case "MinuteByMinute":
      return (
        <div className="group grid grid-flow-col items-center justify-center gap-2 text-sm">
          <InputField
            name="repeateEveryMinut"
            label="Repeate Every"
            onKeyDown={handleKeyDown}
          />
        </div>
      );
    case "Hourly":
    case "Daily":
      return (
        <div className="group grid grid-flow-col items-center justify-center gap-2 text-sm">
          <TimePickerField name="repeateEveryHourOrDaily" label="At" />
        </div>
      );
    case "Weekly":
      return (
        <div className="group grid grid-flow-col items-center justify-center gap-2 text-sm">
          <p>On specific weekdays</p>
          <MultiSelectField
            className="flex-shrink"
            name="repeateEveryWeekDays"
            selectOptions={enumToArray(DayOfWeek)}
          />
          <p> at</p>
          <TimePickerField name="repeateEveryAtHour" />
        </div>
      );
    case "MonthlyDayOfMonth":
      return (
        <div>
          <div className="group grid grid-flow-col items-center justify-center gap-2 text-sm">
            <p>Repeate Every</p>
            <InputField className="flex-shrink" name="repeateEvery" />
            <p>month(s) at</p>
            <TimePickerField name="repeateEveryAtHour" />
          </div>
          <MultiSelectField
            label="Running on"
            className="flex-shrink"
            name="repeateEveryAtDay"
            selectOptions={[
              { label: "Last day of the month", value: "lastDayOfMonth" },
              {
                label: "Last working day of the month",
                value: "lastWorkingDayOfMonth",
              },
              ...Enumerable.range(0, 31).select<ISelectOption>((x) => ({
                label: x.toString(),
                value: x.toString(),
              })),
            ]}
          />
        </div>
      );
    case "MonthlyDayOfWeek":
      return (
        <div>
          <div className="group grid grid-flow-col items-center justify-center gap-2 text-sm">
            <p>Repeate Every</p>
            <InputField className="flex-shrink" name="repeateEvery" />
            <p>month(s) at</p>
            <TimePickerField name="repeateEveryAtHour" />
          </div>
          <MultiSelectField
            label="Running on"
            className="flex-shrink"
            name="repeateEveryWeekDay"
            selectOptions={enumToArray(DayOfWeek)}
          />
        </div>
      );
    default:
      return;
  }
};
