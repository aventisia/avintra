import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },
  { key: "name", value: "Space name" },
  { key: "totalUsers", value: "Total users" },
  { key: "totalPublishedAgents", value: "Total published agents" },
  { key: "totalExecutionTime", value: "Total execution time (last 30 days)" },
  { key: "totalMachinesAttached", value: "Total machines attached" },
  { key: "createdOn", value: "Created on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
