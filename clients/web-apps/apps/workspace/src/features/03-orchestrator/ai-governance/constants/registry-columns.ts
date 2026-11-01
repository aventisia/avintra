import type { KeyValueLookupType } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "name", value: "Agent name" },
  { key: "compositeTier", value: "Composite risk tier" },
  { key: "status", value: "Status" },
  { key: "openIssues", value: "Open issues" },
  { key: "reviewDate", value: "Reviewed on" },
  { key: "approvalDate", value: "Approved on" },
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

export const AGENT_RISK_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
};

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
