import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the notifications feature component.
const NotificationsManagement = lazy(() =>
  import("@/features/notifications/components/NotificationsManagement").then((module) => ({
    default: module.NotificationsManagement,
  })),
);

/**
 * Renders the NotificationsPage component for tenant admins.
 * @returns JSX element representing the NotificationsPage component.
 */
export const NotificationsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <NotificationsManagement />
    </Suspense>
  );
};
