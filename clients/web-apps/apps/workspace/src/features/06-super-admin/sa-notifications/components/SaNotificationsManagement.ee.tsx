import { useDocumentTitle } from "@avplatform/ui/hooks";

import { SaNotificationsTable } from "./SaNotificationsTable.ee";

/**
 * Management view for creating and sending platform-wide notifications as a Super Admin.
 * Renders the notifications table, which owns the toolbar (heading, search, column
 * view filter, create button) and the create/view/edit/delete dialogs.
 */
export const SaNotificationsManagement = () => {
  // Set the document title
  useDocumentTitle("Notifications");

  return (
    <div className="space-y-6 py-4">
      <SaNotificationsTable />
    </div>
  );
};
