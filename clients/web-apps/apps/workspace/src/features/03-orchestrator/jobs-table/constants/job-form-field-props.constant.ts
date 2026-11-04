import { AsyncSingleSelectFieldProps } from "@avplatform/ui/async-select";
import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";
import { ISelectOption } from "@avplatform/ui/types";
import { enumToArray } from "@avplatform/ui/utils";

import { JsonEditorFieldProps } from "@/components/json-editor/JsonEditorField";
import { searchFlowVersions } from "@/features/search-by-query/apis/search-flow-version.api";
import { searchMachines } from "@/features/search-by-query/apis/search-machine.api";
import { FlowVersionSelectOption } from "@/features/search-by-query/types/flow-version-select-option.type";
import {
  FlowVersionSearchQueryFilters,
  MachineSearchQueryFilters,
} from "@/features/search-by-query/types/search-filters";

import { JobPriorityEnum, JobStatusEnum, TriggerTypesEnum } from "..";

const CLOSING_JOB_STATUSES = [
  JobStatusEnum.Completed,
  JobStatusEnum.Failed,
  JobStatusEnum.Aborted,
  JobStatusEnum.Canceled,
  JobStatusEnum.Killed,
];

export const flowVersionIdProps: AsyncSingleSelectFieldProps<
  FlowVersionSelectOption,
  FlowVersionSearchQueryFilters
> = {
  name: "flowVersionId",
  label: "Agent",
  isRequired: true,
  queryKeyBase: "job-form-published-flow-versions",
  fetcher: (query, filters) =>
    searchFlowVersions(query, FlowTypesEnum.Agent, true, filters ?? undefined).then(
      (res) => res.data ?? [],
    ),
  filters: { machineId: null },
  getItemId: (item) => item.value,
  getItemLabel: (item) => item.label,
  placeholder: "Search published agents...",
  description: "Search and select a published agent that the job should execute.",
};

export const triggerTypeProps: SelectFieldProps = {
  name: "triggerType",
  label: "Trigger type",
  isRequired: true,
  disabled: true,
  selectOptions: enumToArray(TriggerTypesEnum),
  description: "The trigger type is always manual for jobs created from this form.",
};

export const priorityProps: SelectFieldProps = {
  name: "priority",
  label: "Priority",
  isRequired: true,
  selectOptions: enumToArray(JobPriorityEnum),
  description: "Select the priority level for the job.",
};

export const statusProps: SelectFieldProps = {
  name: "status",
  label: "Status",
  isRequired: true,
  selectOptions: enumToArray(JobStatusEnum),
  description: "The current status of the job.",
};

export const closingStatusProps: SelectFieldProps = {
  name: "closingStatus",
  label: "Closing status",
  isRequired: true,
  selectOptions: CLOSING_JOB_STATUSES.map((status) => ({
    value: status,
    label: status,
  })),
  description: "Select a terminal status to manually close the job.",
};

export const executeOnCloudProps: SwitchFieldProps = {
  name: "executeOnCloud",
  label: "Run on cloud",
  description: "Turn off to run the job on a registered machine instead.",
};

export const enableClosingStatusProps: SwitchFieldProps = {
  name: "isClosingStatusEnabled",
  label: "Close job",
  description: "Set a terminal status by hand. Remarks are required.",
};

export const executionLocationProps: AsyncSingleSelectFieldProps<
  ISelectOption,
  MachineSearchQueryFilters
> = {
  name: "executionLocation",
  label: "Machine",
  isRequired: true,
  queryKeyBase: "job-form-machines",
  fetcher: (query, filters) =>
    searchMachines(query, filters ?? undefined).then((res) => res.data ?? []),
  filters: { flowVersionId: null },
  getItemId: (item) => item.value,
  getItemLabel: (item) => item.label,
  placeholder: "Search machines...",
  description: "Search and select a registered machine to execute the job.",
};

export const existingJobIdProps: InputFieldProps = {
  name: "existingJobId",
  label: "Existing job ID",
  placeholder: "00000000-0000-0000-0000-000000000000",
  description: "Optional. Reuse this job ID so the run counts as a retry.",
};

export const jobInputDataProps: JsonEditorFieldProps = {
  name: "jobInputData",
  label: "Input data",
  description:
    "Provide a valid JSON payload that will be passed to the job as input data. Leave as-is or empty to submit without input data.",
};

export const remarksProps: TextareaFieldProps = {
  name: "remarks",
  label: "Remarks",
  className: "min-h-[6rem]",
  required: true,
  placeholder: "e.g. Canceled after the source file was replaced",
  description: "Why the job is being closed.",
};
