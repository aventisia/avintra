import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Agent Name" },
  { key: "status", value: "Status" },
  { key: "startTime", value: "Start Time" },
  { key: "endTime", value: "End Time" },
  { key: "duration", value: "Duration (Seconds)" },
  { key: "retryCount", value: "Retry Count" },
  { key: "versionNumber", value: "Version" },
  { key: "executedBy", value: "Executed By" },
  { key: "executedOn", value: "Executed On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
