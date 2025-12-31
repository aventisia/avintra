import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "effectiveDate", value: "Effective Date" },
  { key: "renewalDate", value: "Renewal Date" },
  { key: "expiresOn", value: "Expires On" },
  { key: "createdOn", value: "Created On" },
  { key: "createdBy", value: "Created By" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
