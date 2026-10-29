import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the TenantsTable component.
const TenantsTable = lazy(() =>
  import("@/features/06-super-admin/tenants-table/components/TenantsTable.ee").then((module) => ({
    default: module.TenantsTable,
  })),
);

/**
 * Renders the TenantsPage component.
 * @returns JSX element representing the TenantsPage component.
 */
export const TenantsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <TenantsTable />
    </Suspense>
  );
};
