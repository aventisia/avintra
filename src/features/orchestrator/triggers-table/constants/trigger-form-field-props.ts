import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from "@aventisia/ui/form";
import { ISelectOption } from "@aventisia/ui/types";
import { enumToArray } from "@aventisia/ui/utils";
import Enumerable from "linq";
import timezones from "timezones-list";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";
import { DayOfWeek } from "@/react-toolkit/enums/day-of-week-enum";
import { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { InputAndTimeComboFieldProps } from "@/react-toolkit/ui/form/fields/combo/InputAndTimeComboField";
import { MultiSelectAndTimeComboFieldProps } from "@/react-toolkit/ui/form/fields/combo/MultiSelectAndTimeComboField";
import { DateTimePickerFieldProps } from "@/react-toolkit/ui/form/fields/DateTimePickerField";
import { MultiSelectFieldProps } from "@/react-toolkit/ui/form/fields/MultiSelectField";
import { getSearchOptionsForAsyncSelect } from "@/react-toolkit/utils";

// trigger Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Trigger Id",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  placeholder: "exampleTrigger",
};
// Type of Environmnet
export const environmentTypeProps: SelectFieldProps = {
  name: "environment",
  label: "Environment Type",
  isRequired: true,
  selectOptions: enumToArray(MachineEnvironmentTypesEnum),
};
// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Schedule ending of job execution",
  description:
    "Disable this triggrt if it's been not in use, or not required anymore",
};

export const selectTimeZoneProps: AsyncSelectFieldProps = {
  name: "timezone",
  label: "Time zone",
  isRequired: true,
  size: "base",
  getOptionValue: (option) => option.value.toLowerCase(),
  selectOptions: (search) =>
    getSearchOptionsForAsyncSelect(
      Enumerable.from(timezones)
        .select<ISelectOption>((t) => ({
          value: t.tzCode,
          label: t.label,
        }))
        .toArray(),
      search,
    ),
  triggerClassName: "w-full",
  className: "w-fit ",
};

export const selectFrequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Frequency",
  isRequired: true,
  selectOptions: enumToArray(TriggerFrequencyTypesEnum),
};

export const scheduleEnding: SwitchFieldProps = {
  name: "isEnds",
  label: "Schedule ending of job execution",
  description: "",
  showBorder: false,
};

export const weeklyFrequencyRepeateProps: MultiSelectAndTimeComboFieldProps = {
  timePickerProps: {
    name: "repeateAt",
    label: "Repeate at",
    isRequired: true,
  },
  selectFieldProps: {
    label: "Repeate on",
    placeholder: "select weekdays",
    name: "repeateOn",
    isRequired: true,
    maxCount: 2,
    selectOptions: enumToArray(DayOfWeek),
  },
};

export const monthlyFrequencyProps: InputAndTimeComboFieldProps = {
  inputFieldProps: {
    label: "Repeate every",
    name: "repeateEvery",
    min: 1,
    max: 31,
    isRequired: true,
    type: "tel",
  },
  timePickerProps: {
    name: "repeateAt",
    label: "Repeate at",
    isRequired: true,
  },
};

export const monthlyFrequencyRepeateProps: MultiSelectFieldProps = {
  label: "Running on",
  className: "flex-shrink",
  name: "repeateOn",
  selectOptions: [],
};

export const nonWorkingDays: DateTimePickerFieldProps = {
  name: "nonWorkingDays",
  label: "Schedule non working days",
  isRequired: true,
};

export const scheduleNonWorkingDays: SwitchFieldProps = {
  name: "hasNonWorkingDays",
  label: "Schedule non working days",
  showBorder: false,
  description: "",
};

export const scheduleNonWorkingTimeRange: SwitchFieldProps = {
  name: "hasNonWorkingTime",
  label: "Schedule non working time range",
  showBorder: false,
  description: "",
};

export const trigerForNewItem: SwitchFieldProps = {
  name: "trigerForNewItem",
  label: "Trigger when new work item added",
  description: "",
  showBorder: false,
};

export const trigerFornNewEmail: SwitchFieldProps = {
  name: "trigerFornNewEmail",
  label: "Trigger when new email arrieves",
  description: "",
  showBorder: false,
};

export const generateStuckAlert: SwitchFieldProps = {
  name: "generateStuckAlert",
  label: "Generate an alert if the job is stuck in pending or resumed status",
  description: "",
  showBorder: false,
};

export const generateFailedAlert: SwitchFieldProps = {
  name: "generateFailedAlert",
  label: "Generate an alert if the job is started and has not completed",
  description: "",
  showBorder: false,
};
