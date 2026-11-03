import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the TenantInstanceTable component.
const TenantInstanceTable = lazy(() =>
  import("@/features/global-admin/on-prem-tenant-instance/components/TenantInstanceTable.ee").then(
    (module) => ({
      default: module.TenantInstanceTable,
    }),
  ),
);

/**
 * Renders the TenantInstancePage component.
 * @returns JSX element representing the TenantInstancePage component.
 */
export const TenantInstancePage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <TenantInstanceTable />
    </Suspense>
  );
};
