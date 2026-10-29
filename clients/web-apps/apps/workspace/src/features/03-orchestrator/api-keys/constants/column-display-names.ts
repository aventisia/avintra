import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
const columnDisplayNames: KeyValueLookupType[] = [
  { key: "selectRow", value: "Select row" },
  { key: "id", value: "ID" },
  { key: "name", value: "Name" },
  { key: "keyPrefix", value: "Secret key" },
  { key: "expiresAt", value: "Expires at" },
  { key: "status", value: "Status" },
  { key: "lastUsedAt", value: "Last used" },
  { key: "permissions", value: "Permissions" },
  { key: "createdBy", value: "Created by" },
  { key: "createdOn", value: "Created at" },
  { key: "lastModifiedBy", value: "Last modified by" },
  { key: "lastModifiedOn", value: "Last modified at" },
];

// Get the column display name for the given column key.
const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};

export { columnDisplayNames, getColumnName };
