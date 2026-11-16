import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the OnPremTenantsTable component.
const OnPremTenantsTable = lazy(() =>
  import("@/features/global-admin/on-prem-tenant/components/OnPremTenantsTable.ee").then(
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
    <Suspense fallback={<TableCNSkeleton />}>
      <OnPremTenantsTable />
    </Suspense>
  );
};
