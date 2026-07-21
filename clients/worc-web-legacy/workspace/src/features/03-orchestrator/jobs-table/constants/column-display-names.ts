import { KeyValueLookupType } from "@aventisia/ui/types";

import { JobStatusEnum } from "..";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "selectRow", value: "Select Row" },
  { key: "flowName", value: "Agent" },
  { key: "status", value: "Status" },
  { key: "startTimeStamp", value: "Started At" },
  { key: "endTimeStamp", value: "Ended At" },
  { key: "duration", value: "Duration" },
  { key: "creditsConsumed", value: "Credits" },
  { key: "remarks", value: "Remarks" },
  { key: "isFlowVersionPublished", value: "Is Published" },
  { key: "retryCount", value: "Retry #" },
  { key: "triggerType", value: "Trigger Type" },
  { key: "priority", value: "Priority" },
  { key: "createdByName", value: "Created By" },
  { key: "createdAt", value: "Created At" },
  { key: "executionLocation", value: "Execution Location" },
  { key: "remarks", value: "Remarks" },
  { key: "flowVersionId", value: "Agent ID" },
  { key: "id", value: "Job ID" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

// TODO: We need to set the color for each status in the html to avoid tailwind css purging the unused classes
export const statusColor: { [key in JobStatusEnum]: string } = {
  [JobStatusEnum.Completed]: "bg-green-200 text-green-700",
  [JobStatusEnum.Running]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Aborted]: "bg-orange-200 text-orange-600",
  [JobStatusEnum.Canceled]: "bg-orange-200 text-orange-600",
  [JobStatusEnum.Cleanup]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Paused]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Resumed]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Retrying]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Created]: "bg-slate-200 text-slate-600",
  [JobStatusEnum.Failed]: "bg-red-200 text-red-600",
  [JobStatusEnum.Killed]: "bg-orange-200 text-orange-600",
};
