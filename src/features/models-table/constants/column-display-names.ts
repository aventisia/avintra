import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "llm", value: "LLM" },
  { key: "accuracy", value: "Accuracy" },
  { key: "docsProcessed", value: "Records Processed" },
  { key: "description", value: "Description" },
  { key: "createdOn", value: "Created On" },
  { key: "trainedOn", value: "Trained On" },
  { key: "setupStatus", value: "Setup Status" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
