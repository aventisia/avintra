import {
  InputFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { JobPriorityEnum, JobStatusEnum, TriggerTypesEnum } from "..";

export const idProps: InputFieldProps = {
  name: "id",
  label: "Job Id",
  disabled: true,
};

export const flowVersionIdProps: InputFieldProps = {
  name: "flowVersionId",
  label: "Agent Id",
  isRequired: true,
  placeholder: "Enter agent id",
};

export const triggerTypeProps: SelectFieldProps = {
  name: "triggerType",
  label: "Trigger Type",
  isRequired: true,
  selectOptions: enumToArray(TriggerTypesEnum),
};

export const priorityProps: SelectFieldProps = {
  name: "priority",
  label: "Priority",
  isRequired: true,
  selectOptions: enumToArray(JobPriorityEnum),
};

export const statusProps: SelectFieldProps = {
  name: "status",
  label: "Status",
  isRequired: true,
  selectOptions: enumToArray(JobStatusEnum),
};

export const retryCountProps: InputFieldProps = {
  name: "retryCount",
  label: "Retry Count",
  type: "number",
  isRequired: true,
  min: 0,
};

export const executionLocationProps: InputFieldProps = {
  name: "executionLocation",
  label: "Execution Location",
  isRequired: true,
  placeholder: "Cloud",
};

export const remarksProps: TextareaFieldProps = {
  name: "remarks",
  label: "Remarks",
  className: "min-h-[6rem]",
};
