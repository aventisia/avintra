import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

const Notifications = lazy(() =>
  import("@/react-toolkit/features/unread-notifications/components/notifications-page/NotificationsPage").then(
    (module) => ({ default: module.NotificationsPage }),
  ),
);

export const MyNotificationsPage = () => (
  <Suspense fallback={<TableCNSkeleton />}>
    <Notifications />
  </Suspense>
);
