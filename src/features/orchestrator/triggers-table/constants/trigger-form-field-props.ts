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
import { MachineEnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";
import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { DateTimePickerFieldProps } from "@/react-toolkit/ui/form/fields/DateTimePickerField";
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
export const selectProcessProps: SelectFieldProps = {
  name: "process",
  label: "Process",
  isRequired: true,
  selectOptions: [],
};
export const selectJobPriorityProps: SelectFieldProps = {
  name: "jobPriority",
  label: "Job Prority",
  isRequired: true,
  selectOptions: [],
};
export const selectRuntimeTypeProps: SelectFieldProps = {
  name: "runtimeType",
  label: "Runtime Type",
  isRequired: true,
  selectOptions: [],
};
export const selectTimeZoneProps: AsyncSelectFieldProps = {
  name: "timeZone",
  label: "TimeZone",
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
  className: "w-[37rem]",
};
export const selectFrequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Frequency",
  selectOptions: enumToArray(TriggerFrequencyTypesEnum),
};
export const selectRepetationProps: SelectFieldProps = {
  name: "repeateEvery",
  label: "Repeat Every",
  selectOptions: [],
};

export const selectNonWorkingDaysProps: SelectFieldProps = {
  name: "nonWorkingDays",
  label: "Non-working days restriction",
  selectOptions: [],
};

export const scheduleEnding: SwitchFieldProps = {
  name: "scheduleEnding",
  label: "Schedule ending of job execution",
  description: "",
  showBorder: false,
};

export const nonWorkingDays: DateTimePickerFieldProps = {
  name: "nonWorkingDays",
  label: "Schedule non working days",
};

export const scheduleNonWorkingDays: SwitchFieldProps = {
  name: "scheduleNonWorkingDays",
  label: "Schedule non working days",
  showBorder: false,
  description: "",
};

export const scheduleRetristredTimeZone: SwitchFieldProps = {
  name: "scheduleRetristredTimeZone",
  label: "Schedule restricted time zone",
  showBorder: false,
  description: "",
};

export const scheduleAutoDisabling: SwitchFieldProps = {
  name: "scheduleAutoDisabling",
  label: "Schedule automatic trigger disabling",
  description: "",
  showBorder: false,
};

export const trigerForNewItem: SwitchFieldProps = {
  name: "trigerForNewItem",
  label: "Trigger when new work item added",
  description: "",
  showBorder: false,
};

export const trigerFornNewEmail: SwitchFieldProps = {
  name: "trigerFornNewEmail",
  label: "Trigger when new email arrieved",
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
