import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the OnPremTenantsTable component.
const OnPremTenantsTable = lazy(() =>
  import("@/features/07-global-admin/on-prem-tenant/components/OnPremTenantsTable.ee").then(
    (module) => ({
      default: module.OnPremTenantsTable,
    }),
  ),
);

/**
 * Renders the OnPremTenantsPage component.
 * @returns JSX element representing the OnPremTenantsPage component.
 */
export const OnPremTenantsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <OnPremTenantsTable />
    </Suspense>
  );
};
