import { KeyValueLookupType } from "@aventisia/ui/types";

import { QueueWorkItemStatusEnum } from "@/react-toolkit/enums/queue-work-item-status-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "queueName", value: "Queue Name" },
  { key: "status", value: "Status" },
  { key: "lastModifiedOn", value: "Last Updated On" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusColor: { [key in QueueWorkItemStatusEnum]: string } = {
  [QueueWorkItemStatusEnum.Completed]: "bg-green-200 text-green-700",
  [QueueWorkItemStatusEnum.InProgress]: "bg-slate-200 text-slate-600",
  [QueueWorkItemStatusEnum.Pending]: "bg-orange-200 text-orange-600",
  [QueueWorkItemStatusEnum.Failed]: "bg-red-200 text-red-600",
};
