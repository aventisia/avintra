import { KeyValueLookupType } from "@aventisia/ui/types";

import { JobStatusTypesEnum } from "../enums/job-status-type-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Agent Name" },
  { key: "status", value: "Status" },
  { key: "startTime", value: "Start Time" },
  { key: "endTime", value: "End Time" },
  { key: "duration", value: "Duration (Seconds)" },
  { key: "retryCount", value: "Retry Count" },
  { key: "versionNumber", value: "Version" },
  { key: "executedBy", value: "Executed By" },
  { key: "executedOn", value: "Executed On" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusColor: { [key in JobStatusTypesEnum]: string } = {
  [JobStatusTypesEnum.Completed]: "bg-green-200 text-current",
  [JobStatusTypesEnum.Running]: "bg-slate-200 text-current",
  [JobStatusTypesEnum.Abort]: "bg-orange-200 text-current",
  [JobStatusTypesEnum.Canceled]: "bg-orange-200 text-current",
  [JobStatusTypesEnum.Cleanup]: "bg-slate-200 text-current",
  [JobStatusTypesEnum.Paused]: "bg-slate-200 text-current",
  [JobStatusTypesEnum.Resumed]: "bg-slate-200 text-current",
  [JobStatusTypesEnum.Retrying]: "bg-slate-200 text-current",
  [JobStatusTypesEnum.Created]: "bg-slate-200 text-current",

  [JobStatusTypesEnum.Failed]: "bg-red-200 text-current",
};
