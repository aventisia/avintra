import { KeyValueLookupType } from "@aventisia/ui/types";

import { JobStatusTypesEnum } from "../enums/job-status-type-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Agent Name" },
  { key: "status", value: "Status" },
  { key: "startTime", value: "Start Time" },
  { key: "endTime", value: "End Time" },
  { key: "duration", value: "Duration" },
  { key: "isPublished", value: "Is Published" },
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
  [JobStatusTypesEnum.Completed]: "bg-green-200 text-green-700",
  [JobStatusTypesEnum.Running]: "bg-slate-200 text-slate-600",
  [JobStatusTypesEnum.Abort]: "bg-orange-200 text-orange-600",
  [JobStatusTypesEnum.Canceled]: "bg-orange-200 text-orange-600",
  [JobStatusTypesEnum.Cleanup]: "bg-slate-200 text-slate-600",
  [JobStatusTypesEnum.Paused]: "bg-slate-200 text-slate-600",
  [JobStatusTypesEnum.Resumed]: "bg-slate-200 text-slate-600",
  [JobStatusTypesEnum.Retrying]: "bg-slate-200 text-slate-600",
  [JobStatusTypesEnum.Created]: "bg-slate-200 text-slate-600",
  [JobStatusTypesEnum.Failed]: "bg-red-200 text-red-600",
};
