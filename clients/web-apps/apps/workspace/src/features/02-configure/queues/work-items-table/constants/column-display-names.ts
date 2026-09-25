import { QueueWorkItemStatusEnum } from "@avplatform/ui/enums/queue-work-item-status-enum";
import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "queueName", value: "Queue Name" },
  { key: "status", value: "Status" },
  { key: "lastModifiedOn", value: "Last Updated On" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
  { key: "sourceWorkItemId", value: "Source Work Item Id" },
  { key: "retryTime", value: "Retry Time" },
  { key: "retryCount", value: "Retry Count" },
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

/**
 * Fallback badge classes used for custom statuses that do not have a predefined color.
 */
const DEFAULT_STATUS_COLOR = "bg-slate-200 text-slate-600";

/**
 * Returns the badge classes for a given status, falling back to a neutral style
 * for custom statuses that are not part of the core set.
 */
export const getStatusColor = (status?: string | null): string => {
  if (!status) return DEFAULT_STATUS_COLOR;
  return statusColor[status as QueueWorkItemStatusEnum] ?? DEFAULT_STATUS_COLOR;
};
