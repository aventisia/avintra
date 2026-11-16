import {
  type DateTimePickerFieldProps,
  InputFieldProps,
  MultiSelectFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

import { generateDayOfWeekOptions, generateHourlyWithRangeOptions } from "./form-utils";

const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique name",
  isRequired: true,
  placeholder: "e.g. Nightly invoice sync",
  description:
    "Specify a **unique** name for this trigger.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Cannot be changed** after creation.",
};

const selectFrequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Frequency",
  isRequired: true,
  selectOptions: enumToArray(TriggerFrequencyTypesEnum),
  description: "Choose how frequently the trigger should run or repeat.",
};

const effectiveDateProps: DateTimePickerFieldProps = {
  name: "effectiveDate",
  label: "Starts on",
  description: "Date and time the schedule starts.",
  isRequired: true,
  granularity: "minute",
};

const endDateProps: DateTimePickerFieldProps = {
  name: "endDate",
  label: "Ends on",
  description: "Optional date and time after which the trigger stops.",
  granularity: "minute",
};

const timezoneLabelProps = {
  label: "Timezone",
  description: "Timezone the schedule runs in.",
  isRequired: true,
};

const LOCKED_EFFECTIVE_DATE_DESCRIPTION =
  "The trigger has already started, so its start date can no longer change.";

const exceptionDatesLabelProps = {
  label: "Exception dates",
  description: "Dates to skip, in YYYY-MM-DD format.",
};

const agentsLabelProps = {
  label: "Agents",
  description: "Agents to run on each scheduled time.",
  isRequired: true,
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable trigger",
  description: "Turn it off when it’s not needed or should be paused.",
};

const exceptionHoursProps: MultiSelectFieldProps = {
  name: "exceptionHours",
  label: "Exception hours",
  description: "Hours of the day to skip.",
  selectOptions: generateHourlyWithRangeOptions(),
};

const exceptionWeekdaysProps: MultiSelectFieldProps = {
  name: "exceptionWeekdays",
  label: "Exception weekdays",
  description: "Weekdays to skip, for example weekends.",
  selectOptions: generateDayOfWeekOptions(),
};

export {
  agentsLabelProps,
  effectiveDateProps,
  endDateProps,
  exceptionDatesLabelProps,
  exceptionHoursProps,
  exceptionWeekdaysProps,
  isDisabledProps,
  LOCKED_EFFECTIVE_DATE_DESCRIPTION,
  nameProps,
  selectFrequencyProps,
  timezoneLabelProps,
};
