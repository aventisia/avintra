import { KeyValueLookupType } from "@aventisia/ui/types";

import { JobStatusEnum } from "../enums/job-status-enum";

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

export const statusColor: { [key in JobStatusEnum]: string } = {
  [JobStatusEnum.Completed]: "bg-green-200 text-green-700",
  [JobStatusEnum.Running]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Abort]: "bg-orange-200 text-orange-600",
  [JobStatusEnum.Canceled]: "bg-orange-200 text-orange-600",
  [JobStatusEnum.Cleanup]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Paused]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Resumed]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Retrying]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Created]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Failed]: "bg-red-200 text-red-600",
  [JobStatusEnum.Killed]: "bg-orange-200 text-orange-600",
};
