import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the TenantInstanceDataTable component.
const TenantInstanceDataTable = lazy(() =>
  import("@/features/global-admin/tenant-instance-data/components/TenantInstanceDataTable.ee").then(
    (module) => ({
      default: module.TenantInstanceDataTable,
    }),
  ),
);

/**
 * Renders the TenantInstanceDataPage component.
 * @returns JSX element representing the TenantInstanceDataPage component.
 */
export const TenantInstanceDataPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <TenantInstanceDataTable />
    </Suspense>
  );
};
