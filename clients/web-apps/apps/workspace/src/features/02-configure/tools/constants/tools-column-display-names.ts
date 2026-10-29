import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "description", value: "Description" },
  { key: "type", value: "Type" },
  { key: "baseUrl", value: "Base URL" },
  { key: "authenticationType", value: "Authentication" },
  { key: "isActive", value: "Active" },
  { key: "isVerified", value: "Verified" },
  { key: "isTenantWideAccess", value: "Tenant wide" },
  { key: "createdOn", value: "Created on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
