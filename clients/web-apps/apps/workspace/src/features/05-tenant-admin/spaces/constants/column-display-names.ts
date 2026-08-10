import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Space Name" },
  { key: "totalUsers", value: "Total Users" },
  { key: "totalPublishedAgents", value: "Total Published Agents" },
  { key: "totalExecutionTime", value: "Total Execution Time (Last 30 Days)" },
  { key: "totalMachinesAttached", value: "Total Machines Attached" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
