import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "id" },
  { key: "flowId", value: "Agent Id" },
  { key: "name", value: "Name" },
  { key: "isLocked", value: "Locked" },
  { key: "isArchived", value: "Archived" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "created On" },
  { key: "versionNumber", value: "Version" },
  { key: "lastModifiedBy", value: "Last Modified By" },
  { key: "lastModifiedOn", value: "Last Modified On" },
  { key: "machineCount", value: "Machines" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
