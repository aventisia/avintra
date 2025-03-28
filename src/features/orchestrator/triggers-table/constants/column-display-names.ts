import { KeyValueLookupType } from "@/react-toolkit/types/key-value-lookup-type"

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "jobPriority", value: "Job Priority" },
  { key: "nextRunTime", value: "Next RunTime" },
  { key: "stopAfter", value: "Stop After" },
]

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key)
  return column?.value ?? key
}
