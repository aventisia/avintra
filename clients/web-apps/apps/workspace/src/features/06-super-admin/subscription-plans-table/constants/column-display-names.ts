import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Plan ID" },
  { key: "name", value: "Plan Name" },
  { key: "uniqueName", value: "Unique Name" },
  { key: "type", value: "Type" },
  { key: "price", value: "Price" },
  { key: "currency", value: "Currency" },
  { key: "frequency", value: "Billing Frequency" },
  { key: "maxCredits", value: "No of credits" },
  { key: "maxPublishedItems", value: "Publish Agents" },
  { key: "historyRetentionDays", value: "Insights & History (Days)" },
  { key: "maxSpaces", value: "Spaces" },
  { key: "storageLimitMB", value: "Storage (MB)" },
  { key: "maxUsers", value: "Users" },
  { key: "isDisabled", value: "Disable Plan" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
  { key: "lastModifiedBy", value: "Last Modified By" },
  { key: "lastModifiedOn", value: "Last Modified On" },
];

/** Get the column display name for the given column key. */
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value || key;
};
