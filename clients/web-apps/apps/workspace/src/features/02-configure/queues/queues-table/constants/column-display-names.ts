import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "inProgress", value: "In Progress" },
  { key: "pending", value: "Pending" },
  { key: "completed", value: "Completed" },
  { key: "failed", value: "Failed" },
  { key: "total", value: "Total" },
  { key: "lastModifiedOn", value: "Last Updated At" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
