import { TABLE_CN_ACTIONS_COLUMN_ID, TableCNRowLabels } from "@avplatform/ui/table-cn";
import { DialogCrudAction } from "@avplatform/ui/types";
import { InitialTableState } from "@tanstack/react-table";

import { columnVisibilityState } from "./column-visibility-state.ee";

/** Heading of the Super Admin notifications table. */
export const SA_TABLE_HEADING = "Notifications";

/** Table key used for persisting data-table preferences (column visibility / sorting). */
export const SA_TABLE_KEY = "sa-notifications-table";

/** Alias kept for backward compatibility with existing column definitions. */
export const SA_NOTIFICATIONS_TABLE_KEY = SA_TABLE_KEY;

/** Page sizes offered by the table, unchanged from the legacy table. */
export const SA_NOTIFICATIONS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

/** Row labels of the pagination footer. */
export const SA_NOTIFICATIONS_ROW_LABELS: TableCNRowLabels = {
  singular: "notification",
  plural: "notifications",
};

export const SA_NOTIFICATIONS_INITIAL_STATE: InitialTableState = {
  pagination: { pageIndex: 0, pageSize: 50 },
  columnVisibility: columnVisibilityState,
  columnPinning: { right: [TABLE_CN_ACTIONS_COLUMN_ID] },
};

/**
 * Returns the dialog heading/description for the Super Admin notification CRUD dialog.
 */
export const getSaDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create notification", description: "" };
    case "read":
      return { heading: "Notification", description: "" };
    case "update":
      return { heading: "Edit notification", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

/**
 * Formats a PascalCase enum value into a human-friendly label.
 * e.g. "SelectedUsers" -> "Selected Users", "AllUsers" -> "All Users".
 */
export const formatEnumLabel = (value?: string | null): string => {
  if (!value) return "";
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
};
