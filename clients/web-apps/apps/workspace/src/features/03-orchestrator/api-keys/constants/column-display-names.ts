import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
const columnDisplayNames: KeyValueLookupType[] = [
  { key: "selectRow", value: "Select Row" },
  { key: "id", value: "ID" },
  { key: "name", value: "Name" },
  { key: "keyPrefix", value: "Secret Key" },
  { key: "expiresAt", value: "Expires At" },
  { key: "status", value: "Status" },
  { key: "lastUsedAt", value: "Last Used" },
  { key: "permissions", value: "Permissions" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created At" },
  { key: "lastModifiedBy", value: "Last Modified By" },
  { key: "lastModifiedOn", value: "Last Modified At" },
];

// Get the column display name for the given column key.
const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};

export { columnDisplayNames, getColumnName };
