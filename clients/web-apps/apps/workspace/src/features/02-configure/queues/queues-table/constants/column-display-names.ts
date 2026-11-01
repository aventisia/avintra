import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "processingMode", value: "Processing mode" },
  { key: "agentsNames", value: "Agent" },
  { key: "total", value: "Active work items" },
  { key: "lastModifiedOn", value: "Last updated at" },
  { key: "createdBy", value: "Created by" },
  { key: "createdOn", value: "Created on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
