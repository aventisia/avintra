import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "agent", value: "Agent" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
  { key: "lastModifiedBy", value: "Last Modified By" },
  { key: "lastModifiedOn", value: "Last Modified On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
