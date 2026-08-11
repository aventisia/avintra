import { DialogCrudAction } from "@avplatform/ui/types";

/** Heading of the notifications table. */
export const TABLE_HEADING = "Notifications";

/** Table key used for persisting data-table preferences (column visibility / sorting). */
export const TABLE_KEY = "notifications-table";

/** Alias kept for backward compatibility with existing column definitions. */
export const NOTIFICATIONS_TABLE_KEY = TABLE_KEY;

/**
 * Returns the dialog heading/description for the notification CRUD dialog.
 */
export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Notification", description: "" };
    case "read":
      return { heading: "Notification", description: "" };
    case "update":
      return { heading: "Edit Notification", description: "" };
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
