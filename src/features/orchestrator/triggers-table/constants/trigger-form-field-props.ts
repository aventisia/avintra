import { InputFieldProps } from "@aventisia/ui/form";
import { SelectFieldProps } from "@aventisia/ui/form";
import { SwitchFieldProps } from "@aventisia/ui/form";

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
export const selectTimeZoneProps: SelectFieldProps = {
  name: "timeZone",
  label: "TimeZone",
  isRequired: true,
  selectOptions: [],
};
export const selectFrequencyProps: SelectFieldProps = {
  name: "frequency",
  label: "Frequency",
  selectOptions: [],
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

export const scheduleAutoDisabling: SwitchFieldProps = {
  name: "scheduleAutoDisabling",
  label: "Schedule automatic trigger disabling",
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
