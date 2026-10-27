import type { BadgeProps } from "@avplatform/ui/badge";
import { KeyValueLookupType } from "@avplatform/ui/types";

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
