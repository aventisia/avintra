import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "docName", value: "File Name" },
  { key: "status", value: "Status" },
  {key: "createdOn", value: "Created On"},
  {key: "createdBy", value: "Created By"},
  {key: "accuracy", value: "Accuracy"},
  {key: "submitForFineTuning", value: "Fine Tuning"},  
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
