import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the TenantPublishedAgentsDialog component.
const TenantPublishedAgentsDialog = lazy(() =>
  import("@/features/06-super-admin/tenants-table/components/tenant-published-agents/TenantPublishedAgentsDialog.ee").then(
    (module) => ({
      default: module.TenantPublishedAgentsDialog,
    }),
  ),
);

/**
 * Renders the TenantPublishedAgentsPage component.
 * @returns JSX element representing the TenantPublishedAgentsPage component.
 */
export const TenantPublishedAgentsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <TenantPublishedAgentsDialog />
    </Suspense>
  );
};
