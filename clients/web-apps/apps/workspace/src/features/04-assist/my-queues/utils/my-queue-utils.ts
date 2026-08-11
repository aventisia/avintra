import { InputSchemaField } from "../dtos/queues-table-dto";
import { CORE_TABS, TabValue } from "../types/my-queue-types";

/**
 * Determines whether a work item with the given status should be shown under the
 * selected tab. Core tabs map to the core system statuses; any other tab value is
 * treated as a custom status name and matched exactly.
 *
 * The "History" tab shows any work item that is no longer "Current" — i.e. anything
 * that is not Pending or In Progress. This includes Completed, Failed, and any
 * disposition status applied when the item was closed (terminal or not).
 */
export const filterByTabStatus = (tab: TabValue, status?: string) => {
  if (!status) return false;

  switch (tab) {
    case "Current":
      return status === "Pending" || status === "InProgress";
    case "History":
      // Anything not in an active state is considered history (closed items,
      // completed, failed, or any disposition status set on close).
      return status !== "Pending" && status !== "InProgress";
    default:
      // Custom status tab: match the status value exactly.
      return status === tab;
  }
};

/**
 * Builds the ordered list of tabs for a queue. Only the core tabs
 * (Current, History) are shown; queue-specific disposition
 * statuses are intentionally excluded from the tab switches.
 */
export const buildTabs = (): TabValue[] => {
  return [...CORE_TABS];
};

export const generateColumnVisibility = (fields: InputSchemaField[]): Record<string, boolean> =>
  Object.fromEntries(fields.map((f) => [f.name, true]));

/**
 * Formats a duration given in seconds as e.g. "30h 27m 55s".
 * Returns "0s" for zero/negative/undefined values.
 */
export const formatDuration = (seconds?: number): string => {
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};
