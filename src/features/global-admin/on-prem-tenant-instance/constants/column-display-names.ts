import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "platformVersion", value: "Platform Version" },
  { key: "deployedOn", value: "Deployed At" },
  { key: "lastValidatedOn", value: "Last Validated At" },
  { key: "noOfInvalidCheck", value: "Invalid Checks Count" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
