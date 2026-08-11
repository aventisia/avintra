import { useDocumentTitle } from "@avplatform/ui/hooks";

import { NotificationsTable } from "./NotificationsTable";

/**
 * Management view for creating and sending notifications within the current tenant.
 * Renders the notifications table, which owns the toolbar (heading, search, column
 * view filter, create button) and the create/view/edit/delete dialogs.
 */
export const NotificationsManagement = () => {
  // Set the document title
  useDocumentTitle("Notifications");

  return (
    <div className="space-y-6 py-4">
      <NotificationsTable />
    </div>
  );
};
