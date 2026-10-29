import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },
  { key: "firstName", value: "First name" },
  { key: "lastName", value: "Last name" },
  { key: "email", value: "Email" },
  { key: "userRoles", value: "Top role" },
  { key: "spaces", value: "Spaces" },
  { key: "createdOn", value: "Created on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
