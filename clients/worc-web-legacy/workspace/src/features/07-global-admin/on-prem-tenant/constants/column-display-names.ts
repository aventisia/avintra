import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "executionTimeAllowed", value: "Execution Time Allowed" },
  { key: "consumedExecutionTime", value: "Execution Time Consumed" },
  { key: "contractStartDate", value: "Contract Start Date" },
  { key: "contractRenewalDate", value: "Contract Renewal Date" },
  { key: "isAnyInstanceFailed", value: "Last Authentication Status" },
  { key: "createdByUser", value: "Created By" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
