import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the Super Admin notifications feature component.
const SaNotificationsManagement = lazy(() =>
  import("@/features/06-super-admin/sa-notifications/components/SaNotificationsManagement.ee").then(
    (module) => ({
      default: module.SaNotificationsManagement,
    }),
  ),
);

/**
 * Renders the SaNotificationsPage component for super admins.
 * @returns JSX element representing the SaNotificationsPage component.
 */
export const SaNotificationsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <SaNotificationsManagement />
    </Suspense>
  );
};
