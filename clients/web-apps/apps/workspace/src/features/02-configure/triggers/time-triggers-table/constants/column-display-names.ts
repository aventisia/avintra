import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "frequency", value: "Frequency" },
  { key: "lastTriggeredTime", value: "Last triggered" },
  { key: "nextTriggerTime", value: "Next trigger time" },
  { key: "timezone", value: "Timezone" },
  { key: "agents", value: "Agent(s)" },
  { key: "effectiveDate", value: "Effective date" },
  { key: "createdBy", value: "Created by" },
  { key: "createdOn", value: "Created on" },
  { key: "lastModifiedBy", value: "Last modified by" },
  { key: "lastModifiedOn", value: "Last modified on" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
