import {
  DatePickerFieldProps,
  InputFieldProps,
  MultiSelectFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

import { generateDayOfWeekOptions, generateHourlyOptions } from "./form-utils";

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
  description: "Name of the trigger",
};

const selectFrequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Frequency",
  isRequired: true,
  selectOptions: enumToArray(TriggerFrequencyTypesEnum),
  description: "Select frequency at which you trigger needs to run or repeat",
};

// Effective Date
const effectiveDateProps: DatePickerFieldProps = {
  name: "effectiveDate",
  label: "Effective Date",
  description: "The date form when the trigger should start",
  isRequired: true,
};

// Ends on
const endDateProps: DatePickerFieldProps = {
  name: "endDate",
  label: "Ends on",
  description: "The date form when the trigger should end(optional)",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Trigger",
  description:
    "Disable this trigger if it's been not in use, or not required anymore",
};

// Exception Hours
const exceptionHoursProps: MultiSelectFieldProps = {
  name: "exceptionHours",
  label: "Exception Hours",
  description: "The Hours when the trigger should not work",
  selectOptions: generateHourlyOptions(),
};

// Exception Weekdays
const exceptionWeekdaysProps: MultiSelectFieldProps = {
  name: "exceptionWeekdays",
  label: "Exception Weekdays",
  description: "The weekdays when the trigger should not work",
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
