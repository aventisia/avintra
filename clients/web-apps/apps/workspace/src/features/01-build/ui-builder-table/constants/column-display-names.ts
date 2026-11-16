import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "description", value: "Description" },
  { key: "versionCount", value: "Versions" },
  { key: "createdBy", value: "Created By" },
  { key: "lastModifiedOn", value: "Updated On" },
];

export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
