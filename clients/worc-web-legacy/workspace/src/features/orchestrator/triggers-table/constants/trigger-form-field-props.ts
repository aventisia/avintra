import {
  DatePickerFieldProps,
  InputFieldProps,
  MultiSelectFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

import {
  generateDayOfWeekOptions,
  generateHourlyWithRangeOptions,
} from "./form-utils";

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
  label: "Name",
  isRequired: true,
  placeholder: "Trigger Name",
  description: "Specify a name for this trigger.",
};

const selectFrequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Frequency",
  isRequired: true,
  selectOptions: enumToArray(TriggerFrequencyTypesEnum),
  description: "Choose how frequently the trigger should run or repeat.",
};

const effectiveDateProps: DatePickerFieldProps = {
  name: "effectiveDate",
  label: "Effective Date",
  description: "The date when the trigger will begin.",
  isRequired: true,
};

const endDateProps: DatePickerFieldProps = {
  name: "endDate",
  label: "Ends on",
  description: "The optional date when the trigger should stop.",
};

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Trigger",
  description:
    "Disable the trigger when it's not needed or should be temporarily turned off.",
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
  description:
    "Select weekdays when the trigger should be skipped (e.g., weekends).",
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
