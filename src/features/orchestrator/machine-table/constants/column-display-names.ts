import { KeyValueLookupType } from "@/react-toolkit/types/key-value-lookup-type";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "ipAddress", value: "IP Address" },
  { key: "hostname", value: "Host Name" },
  { key: "type", value: "OS Type" },
  { key: "environment", value: "Environment" },
  { key: "agentCount", value: "Agent Count" },
  { key: "status", value: "Status" },
  { key: "isAvailable", value: "Is Available" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
}; 
