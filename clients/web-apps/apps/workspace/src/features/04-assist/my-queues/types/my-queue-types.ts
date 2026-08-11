/**
 * The core tabs always shown in the "My Queues" work item table.
 * "Current" combines Pending + In Progress; "History" holds Completed/Failed.
 * Custom statuses defined on a queue are appended as additional dynamic tabs.
 */
export const CORE_TABS = ["Current", "History"] as const;

/**
 * A tab value is either a core tab or a custom status name.
 */
export type TabValue = string;

export interface WorkItemRow {
  rowId: string;
  status?: string;
  assignee?: string;
  createdOn?: string;
  lastModifiedOn?: string;
  closedOn?: string;
  [key: string]: unknown;
}
