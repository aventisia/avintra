import { lazy, Suspense } from "react";

import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

// Lazy load the SaLicensesTable component.
const SaLicensesTable = lazy(() =>
  import("@/features/sa/licenses-table/components/SaLicensesTable").then(
    (module) => ({
      default: module.SaLicensesTable,
    }),
  ),
);

/**
 * Renders the SaLicensesTable component.
 * @returns JSX element representing the LicensesPage component.
 */
export const SaLicensesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <SaLicensesTable />
    </Suspense>
  );
};
