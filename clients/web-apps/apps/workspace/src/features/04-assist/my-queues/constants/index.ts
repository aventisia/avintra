import type { BadgeProps } from "@avplatform/ui/badge";
import { TABLE_CN_ACTIONS_COLUMN_ID } from "@avplatform/ui/table-cn";
import { InitialTableState } from "@tanstack/react-table";

import { QueueTransactionStatusTypesEnum } from "../enums/queue-work-item-status-enum";

/**
 * The unique key for the my-queues query to be used in the query client. ["my-queues"]
 */
const DATA_QUERY_KEY = ["my-queues"];

const EVENT_QUERY_KEY = "queue-work-item-events";

/**
 * The heading for the queues table.
 */
const TABLE_HEADING = "Queues";

const TABLE_KEY = "my-queues";

/** Page sizes offered by the table, unchanged from the legacy table. */
const MY_QUEUES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const MY_QUEUES_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

type StatusBadgeVariant = NonNullable<BadgeProps["variant"]>;

export const statusBadgeVariant: { [key: string]: StatusBadgeVariant } = {
  [QueueTransactionStatusTypesEnum.Completed]: "completed",
  [QueueTransactionStatusTypesEnum.InProgress]: "running",
  [QueueTransactionStatusTypesEnum.Pending]: "queued",
  [QueueTransactionStatusTypesEnum.Failed]: "failed",
};

/**
 * Fallback badge variant used for custom statuses that do not have a predefined variant.
 */
const DEFAULT_STATUS_BADGE_VARIANT: StatusBadgeVariant = "secondary";

/**
 * Returns the badge variant for a given status, falling back to a neutral variant
 * for custom statuses that are not part of the core set.
 */
export const getStatusBadgeVariant = (status?: string | null): StatusBadgeVariant => {
  if (!status) return DEFAULT_STATUS_BADGE_VARIANT;
  return statusBadgeVariant[status] ?? DEFAULT_STATUS_BADGE_VARIANT;
};

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  TABLE_KEY,
  EVENT_QUERY_KEY,
  MY_QUEUES_INITIAL_STATE,
  MY_QUEUES_PAGE_SIZE_OPTIONS,
};
