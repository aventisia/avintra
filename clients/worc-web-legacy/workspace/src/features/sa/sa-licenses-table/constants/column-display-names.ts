import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "tenantName", value: "Name" },
  { key: "pricingComponent", value: "Pricing Component" },
  { key: "unit", value: "Unit" },
  { key: "allocated", value: "Allocated" },
  { key: "consumed", value: "Consumed" },
  { key: "available", value: "Available" },
  { key: "additionalUnitsRequested", value: "Requested" },
  { key: "status", value: "Status" },
  { key: "unitPrice", value: "Unit Price" },
  { key: "nextBillingDate", value: "Next Billing Date" },
  { key: "overdueBalance", value: "Overdue Balance" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
