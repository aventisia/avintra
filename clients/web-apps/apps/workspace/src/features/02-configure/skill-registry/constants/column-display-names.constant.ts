import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "description", value: "Description" },
  { key: "createdBy", value: "Created by" },
  { key: "createdOn", value: "Created on" },
  { key: "fileCount", value: "Total files" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
