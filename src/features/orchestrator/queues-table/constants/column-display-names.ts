import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "inprogressCount", value: "Inprogress" },
  { key: "pendingCount", value: "Pending" },
  { key: "completedCount", value: "Completed" },
  { key: "failedCount", value: "Failed" },
  { key: "totalCount", value: "Total" },
  { key: "lastUpdatedOn", value: "Last Updated On" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
