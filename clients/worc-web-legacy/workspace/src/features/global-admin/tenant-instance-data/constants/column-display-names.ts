import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "ID" },
  { key: "validatedOn", value: "Validated At" },
  { key: "executionTime", value: "Execution Time" },
  { key: "executedJobs", value: "Executed Jobs" },
  { key: "publishedAgents", value: "Published Agents" },
  { key: "users", value: "Users" },
  { key: "validatedBy", value: "Validated By" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
