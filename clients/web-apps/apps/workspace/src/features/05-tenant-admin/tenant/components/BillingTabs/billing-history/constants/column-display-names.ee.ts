import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Invoice" },
  { key: "paidOn", value: "Paid On" },
  { key: "amount", value: "Amount" },
  { key: "paymentStatus", value: "Payment Status" },
  { key: "type", value: "Type" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
