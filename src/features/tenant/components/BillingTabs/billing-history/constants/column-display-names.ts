import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "invoice", value: "Invoice" },
  { key: "paidOn", value: "Paid On" },
  { key: "amount", value: "Amount" },
  { key: "status", value: "Status" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
