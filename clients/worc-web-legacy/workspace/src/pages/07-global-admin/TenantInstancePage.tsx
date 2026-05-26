import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the TenantInstanceTable component.
const TenantInstanceTable = lazy(() =>
  import(
    "@/features/07-global-admin/on-prem-tenant-instance/components/TenantInstanceTable"
  ).then((module) => ({
    default: module.TenantInstanceTable,
  })),
);

/**
 * Renders the TenantInstancePage component.
 * @returns JSX element representing the TenantInstancePage component.
 */
export const TenantInstancePage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TenantInstanceTable />
    </Suspense>
  );
};
