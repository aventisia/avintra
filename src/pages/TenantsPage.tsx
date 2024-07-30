import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the TenantsTable component.
const TenantsTable = lazy(() =>
  import("@/features/tenants-table/components/TenantsTable").then((module) => ({
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
