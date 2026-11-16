import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "ID" },
  { key: "validatedOn", value: "Validated at" },
  { key: "executionTime", value: "Execution time" },
  { key: "executedJobs", value: "Executed jobs" },
  { key: "publishedAgents", value: "Published agents" },
  { key: "users", value: "Users" },
  { key: "validatedBy", value: "Validated by" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
