import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "id" },
  { key: "flowId", value: "Agent ID" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "status", value: "Status" },
  { key: "createdBy", value: "Published by" },
  { key: "createdOn", value: "Published on" },
  { key: "supportedPlatform", value: "Platform" },
  { key: "lastModifiedBy", value: "Last modified by" },
  { key: "lastModifiedOn", value: "Last modified on" },
  { key: "machineCount", value: "Machines" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
