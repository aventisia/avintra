import { BadgeProps } from "@avplatform/ui/badge";
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

export const statusBadgeVariant: { [key in QueueWorkItemStatusEnum]: BadgeProps["variant"] } = {
  [QueueWorkItemStatusEnum.Completed]: "completed",
  [QueueWorkItemStatusEnum.InProgress]: "running",
  [QueueWorkItemStatusEnum.Pending]: "queued",
  [QueueWorkItemStatusEnum.Failed]: "failed",
};

/**
 * Fallback badge variant used for custom statuses that do not have a predefined variant.
 */
const DEFAULT_STATUS_BADGE_VARIANT: BadgeProps["variant"] = "secondary";

/**
 * Returns the badge variant for a given status, falling back to a neutral style
 * for custom statuses that are not part of the core set.
 */
export const getStatusBadgeVariant = (status?: string | null): BadgeProps["variant"] => {
  if (!status) return DEFAULT_STATUS_BADGE_VARIANT;
  return statusBadgeVariant[status as QueueWorkItemStatusEnum] ?? DEFAULT_STATUS_BADGE_VARIANT;
};
