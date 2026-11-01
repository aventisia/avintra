import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "platformVersion", value: "Platform version" },
  { key: "deployedOn", value: "Deployed at" },
  { key: "lastValidatedOn", value: "Last validated at" },
  { key: "noOfInvalidCheck", value: "Invalid checks count" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
