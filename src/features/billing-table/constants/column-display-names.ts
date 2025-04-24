import { KeyValueLookupType } from "@/react-toolkit/types/key-value-lookup-type";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "status", value: "Status" },
  { key: "amount", value: "Amount" },
  { key: "dueDate", value: "Due Date" },
  { key: "paidOn", value: "Paid On" },
  { key: "invoiceNumber", value: "Invoice Number" },
  { key: "subscriptionId", value: "Subscription Id" },
  { key: "tax", value: "Tax" },
  { key: "totalAmount", value: "Total Amount" },
  { key: "generatedDate", value: "Generated Date" },
  { key: "invoiceDate", value: "Invoice Date" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
