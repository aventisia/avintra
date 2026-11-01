import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "name", value: "Invoice" },
  { key: "paidOn", value: "Paid on" },
  { key: "amount", value: "Amount" },
  { key: "paymentStatus", value: "Payment status" },
  { key: "type", value: "Type" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
