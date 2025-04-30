import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "status", value: "Status" },
  { key: "startTime", value: "Start Time" },
  { key: "endTime", value: "End Time" },
  { key: "duration", value: "Duration" },
  { key: "retryCount", value: "Retry Count" },
  { key: "executionLogs", value: "Logs" },
  { key: "versionNumber", value: "Version" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
