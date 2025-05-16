import { ISelectOption } from "@aventisia/ui/types";
import { enumToArray } from "@aventisia/ui/utils";
import Enumerable from "linq";
import { useMemo } from "react";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";
import { DayOfWeek } from "@/react-toolkit/enums/day-of-week-enum";
import { InputAndTimeComboField } from "@/react-toolkit/ui/form/fields/combo/InputAndTimeComboField";
import { MultiSelectAndTimeComboField } from "@/react-toolkit/ui/form/fields/combo/MultiSelectAndTimeComboField";
import { MultiSelectField } from "@/react-toolkit/ui/form/fields/MultiSelectField";
import { TimePickerField } from "@/react-toolkit/ui/form/fields/TimePickerField";

export const TriggerTimeScheduleInputs = ({
  frequency,
}: {
  frequency?: string;
}) => {
  const frequencyKey = frequency as keyof typeof TriggerFrequencyTypesEnum;

  const daysOptions = useMemo(
    () => [
      { label: "Last day of the month", value: "lastDayOfMonth" },
      {
        label: "Last working day of the month",
        value: "lastWorkingDayOfMonth",
      },
      ...Enumerable.range(1, 31).select<ISelectOption>((x) => ({
        label: x.toString(),
        value: x.toString(),
      })),
    ],
    [],
  );

  switch (frequencyKey) {
    case "MinuteByMinute":
    case "Hourly":
    case "Daily":
      return (
        <div className="flex items-center justify-center gap-2 text-sm">
          <TimePickerField
            name="repeateAt"
            showHours={frequencyKey === "Hourly" || frequencyKey === "Daily"}
            label={frequencyKey === "Daily" ? "Daily at" : "Every "}
          />
        </div>
      );
    case "Weekly":
      return (
        <div className="flex flex-row items-center text-sm">
          <MultiSelectAndTimeComboField
            {...{
              timePickerProps: {
                name: "repeateAt",
                label: "At",
              },
              selectFieldProps: {
                label: "On specific weekdays",
                name: "repeateOn",
                selectOptions: enumToArray(DayOfWeek),
              },
            }}
          />
        </div>
      );
    case "MonthlyDayOfMonth":
    case "MonthlyDayOfWeek":
      return (
        <div className="group flex flex-col gap-2 text-sm">
          <InputAndTimeComboField
            {...{
              inputFieldProps: {
                label: "Repeate Every",
                name: "repeateCount",
                min: 1,
                max: 31,
                type: "tel",
              },
              timePickerProps: {
                name: "repeateAt",
                label: "At",
              },
            }}
          />
          <MultiSelectField
            label="Running on"
            className="flex-shrink"
            name="repeateOn"
            selectOptions={
              frequencyKey === "MonthlyDayOfWeek"
                ? daysOptions
                : enumToArray(DayOfWeek)
            }
          />
        </div>
      );
    default:
      return;
  }
};
