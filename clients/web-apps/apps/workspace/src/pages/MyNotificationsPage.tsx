import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

const Notifications = lazy(() =>
  import("@/react-toolkit/features/unread-notifications/components/notifications-page/NotificationsPage").then(
    (module) => ({ default: module.NotificationsPage }),
  ),
);

export const MyNotificationsPage = () => (
  <Suspense fallback={<DataTableSkeleton />}>
    <Notifications />
  </Suspense>
);
