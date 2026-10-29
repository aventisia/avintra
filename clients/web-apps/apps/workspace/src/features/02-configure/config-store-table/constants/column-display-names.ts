import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "accessLevel", value: "Access level" },
  { key: "isEncrypted", value: "Encrypted" },
  { key: "createdBy", value: "Created by" },
  { key: "createdOn", value: "Created on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
