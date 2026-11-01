import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "mailbox", value: "Account" },
  { key: "folder", value: "Folder" },
  { key: "expiryDateTime", value: "Expiry date" },
  { key: "agents", value: "Agent(s)" },
  { key: "timezone", value: "Timezone" },
  { key: "resubscribeEnabled", value: "Resubscribe enabled (in days)" },
  { key: "resubscribeFrequency", value: "Frequency" },
  { key: "provider", value: "Provider" },
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
