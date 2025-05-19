import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "environment", value: "Environment" },
  { key: "agentIds", value: "Agent Count" },
  { key: "timezone", value: "Timezone" },
  { key: "startsOn", value: "Starts On" },
  { key: "frequency", value: "Frequency" },
  { key: "repeateAt", value: "Repeate At" },
  { key: "repeateOn", value: "Repeate On" },
  { key: "repeateEvery", value: "Repeate Every" },
  { key: "nonWorkingDays", value: "Non Working Days" },
  { key: "hasNonWorkingTime", value: "Non Working Time" },
  { key: "endsOn", value: "Ends On" },
  { key: "triggerForNewItem", value: "Trigger For New Item" },
  { key: "triggerForNewEmail", value: "Trigger For New Email" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
