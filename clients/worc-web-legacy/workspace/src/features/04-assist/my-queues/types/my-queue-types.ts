export const TABS = ["Pending", "In Progress", "History"] as const;

export type TabValue = (typeof TABS)[number];

export interface WorkItemRow {
  rowId: string;
  status?: string;
  [key: string]: unknown;
}
