import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Plan ID" },
  { key: "name", value: "Plan Name" },
  { key: "maxCredits", value: "No of credits" },
  { key: "maxPublishedItems", value: "Publish (Agents/AI Models)" },
  {
    key: "historyRetentionDays",
    value: "Insights & History (Days)",
  },
  { key: "maxSpaces", value: "Spaces" },
  { key: "type", value: "Type" },
  { key: "storageLimitMB", value: "Storage (MB)" },
  { key: "maxUsers", value: "Users" },
  { key: "monthlyPrice", value: "Monthly Charge" },
  { key: "yearlyPrice", value: "Yearly Charge" },
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
