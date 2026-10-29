import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the TenantInstanceDataTable component.
const TenantInstanceDataTable = lazy(() =>
  import("@/features/07-global-admin/tenant-instance-data/components/TenantInstanceDataTable.ee").then(
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
    <Suspense fallback={<DataTableSkeleton />}>
      <TenantInstanceDataTable />
    </Suspense>
  );
};
