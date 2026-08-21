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

// trigger Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Trigger Id",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique Name",
  isRequired: true,
  placeholder: "Trigger Name",
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
  label: "Effective Date & Time",
  description: "The date and time when the trigger will begin.",
  isRequired: true,
  granularity: "minute",
};

const endDateProps: DateTimePickerFieldProps = {
  name: "endDate",
  label: "Ends on",
  description: "The optional date and time when the trigger should stop.",
  granularity: "minute",
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Trigger",
  description: "Disable the trigger when it's not needed or should be temporarily turned off.",
};

const exceptionHoursProps: MultiSelectFieldProps = {
  name: "exceptionHours",
  label: "Exception Hours",
  description: "Select specific hours when this trigger should be skipped.",
  selectOptions: generateHourlyWithRangeOptions(),
};

const exceptionWeekdaysProps: MultiSelectFieldProps = {
  name: "exceptionWeekdays",
  label: "Exception Weekdays",
  description: "Select weekdays when the trigger should be skipped (e.g., weekends).",
  selectOptions: generateDayOfWeekOptions(),
};

export {
  idProps,
  nameProps,
  selectFrequencyProps,
  isDisabledProps,
  effectiveDateProps,
  endDateProps,
  exceptionHoursProps,
  exceptionWeekdaysProps,
};
