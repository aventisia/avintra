import { KeyValueLookupType } from "@/react-toolkit/types/key-value-lookup-type";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Pricing Component" },
  { key: "tenantType", value: "Tenant Type" },
  { key: "tenantName", value: "Tenant Name" },
  { key: "currency", value: "Currency" },
  { key: "unit", value: "Unit" },
  { key: "unitPrice", value: "Unit Price" },
  { key: "frequency", value: "Billing Frequency" },
  { key: "cola", value: "COLA" },
  { key: "createdOn", value: "Created On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
