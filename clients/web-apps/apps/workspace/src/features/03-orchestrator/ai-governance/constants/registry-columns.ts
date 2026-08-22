import type { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "name", value: "Agent Name" },
  { key: "compositeTier", value: "Composite Risk Tier" },
  { key: "status", value: "Status" },
  { key: "openIssues", value: "Open Issues" },
  { key: "reviewDate", value: "Reviewed On" },
  { key: "approvalDate", value: "Approved On" },
];

/** Column visibility initial state for the registry table. */
export const columnVisibilityState = {
  name: true,
  compositeTier: true,
  status: true,
  openIssues: true,
  reviewDate: true,
  approvalDate: true,
};

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
