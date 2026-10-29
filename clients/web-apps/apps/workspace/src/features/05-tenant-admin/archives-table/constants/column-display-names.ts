import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "versionNumber", value: "Version number" },
  { key: "lastModifiedBy", value: "Archived by" },
  { key: "lastModifiedOn", value: "Archived on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
