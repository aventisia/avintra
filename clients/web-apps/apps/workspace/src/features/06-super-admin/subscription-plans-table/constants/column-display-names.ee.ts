import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "name", value: "Plan name" },
  { key: "uniqueName", value: "Unique name" },
  { key: "type", value: "Type" },
  { key: "price", value: "Price" },
  { key: "currency", value: "Currency" },
  { key: "frequency", value: "Billing frequency" },
  { key: "maxCredits", value: "No of credits" },
  { key: "maxPublishedItems", value: "Publish agents" },
  { key: "historyRetentionDays", value: "Insights & history (days)" },
  { key: "maxSpaces", value: "Spaces" },
  { key: "storageLimitMB", value: "Storage (MB)" },
  { key: "maxUsers", value: "Users" },
  { key: "isDisabled", value: "Disable plan" },
  { key: "createdBy", value: "Created by" },
  { key: "createdOn", value: "Created on" },
  { key: "lastModifiedBy", value: "Last modified by" },
  { key: "lastModifiedOn", value: "Last modified on" },
];

/** Get the column display name for the given column key. */
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
