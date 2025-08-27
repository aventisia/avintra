import { KeyValueLookupType } from "@aventisia/ui/types";

/** Array of column names and their corresponding display names. */
export const historyTablecolumnDisplayNames: KeyValueLookupType[] = [
  { key: "version", value: "Version no." },
  { key: "status", value: "Status" },
  { key: "scheduledOn", value: "Scheduled On" },
  { key: "timeZone", value: "Timezone" },
  { key: "accuracy", value: "Accuracy" },
  { key: "record", value: "Records" },
  { key: "fineTunedOn", value: "Fine-Tuned On" },
  { key: "duration", value: "Fine-Tune Duration" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = historyTablecolumnDisplayNames.find(
    (column) => column.key === key,
  );
  return column?.value || key;
};
