import { KeyValueLookupType } from '@/react-toolkit/types/key-value-lookup-type';

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "pricingComponent", value: "pricing Component" },
  { key: "unit", value: "unit" },
  { key: "allocated", value: "allocated" },
  { key: "consumed", value: "consumed" },
  { key: "available", value: "available" },
  { key: "unitPrice", value: "unit Price" },
  { key: "nextBillingDate", value: "next Billing Date" },
  { key: "additionalUintRequested", value: "additional UintRequested" },
  { key: "overdueBalance", value: "overdue Balance" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
}