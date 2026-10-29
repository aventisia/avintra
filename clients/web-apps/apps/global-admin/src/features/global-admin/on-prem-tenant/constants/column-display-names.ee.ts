import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "executionTimeAllowed", value: "Execution time allowed" },
  { key: "consumedExecutionTime", value: "Execution time consumed" },
  { key: "contractStartDate", value: "Contract start date" },
  { key: "contractRenewalDate", value: "Contract renewal date" },
  { key: "isAnyInstanceFailed", value: "Last authentication status" },
  { key: "createdByUser", value: "Created by" },
  { key: "createdOn", value: "Created on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
