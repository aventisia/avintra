import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the SaLicensesTable component.
const SaLicensesTable = lazy(() =>
  import("@/features/sa/sa-licenses-table/components/SaLicensesTable").then(
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
