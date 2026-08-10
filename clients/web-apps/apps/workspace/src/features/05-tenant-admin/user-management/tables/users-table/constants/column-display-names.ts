import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "firstName", value: "First Name" },
  { key: "lastName", value: "Last Name" },
  { key: "email", value: "Email" },
  { key: "userRoles", value: "Top Role" },
  { key: "spaces", value: "Spaces" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
