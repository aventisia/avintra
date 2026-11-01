import type { BadgeProps } from "@avplatform/ui/badge";
import { KeyValueLookupType } from "@avplatform/ui/types";

import { JobStatusEnum } from "../enums/job-status-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "job", value: "Job" },
  { key: "status", value: "Status" },
  { key: "startTimeStamp", value: "Started at" },
  { key: "endTimeStamp", value: "Ended at" },
  { key: "duration", value: "Duration" },
  { key: "creditsConsumed", value: "Credits" },
  { key: "remarks", value: "Remarks" },
  { key: "isFlowVersionPublished", value: "Is published" },
  { key: "retryCount", value: "Retry #" },
  { key: "triggerType", value: "Trigger type" },
  { key: "priority", value: "Priority" },
  { key: "createdByName", value: "Created by" },
  { key: "createdAt", value: "Created at" },
  { key: "executionLocation", value: "Execution location" },
  { key: "flowVersionId", value: "Agent ID" },
  { key: "id", value: "Job ID" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusVariant: { [key in JobStatusEnum]: BadgeProps["variant"] } = {
  [JobStatusEnum.Completed]: "completed",
  [JobStatusEnum.Running]: "running",
  [JobStatusEnum.Aborted]: "failed",
  [JobStatusEnum.Canceled]: "secondary",
  [JobStatusEnum.Cleanup]: "running",
  [JobStatusEnum.Paused]: "queued",
  [JobStatusEnum.Resumed]: "running",
  [JobStatusEnum.Retrying]: "running",
  [JobStatusEnum.Created]: "queued",
  [JobStatusEnum.Failed]: "failed",
  [JobStatusEnum.Killed]: "failed",
};
