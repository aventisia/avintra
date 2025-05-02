import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the LicensesTable component.
const LicensesTable = lazy(() =>
  import(
    "@/features/orchestrator/licenses-table/components/LicensesTable"
  ).then((module) => ({
    default: module.LicensesTable,
  })),
);

/**
 * Renders the LicensesTable component.
 * @returns JSX element representing the LicensesPage component.
 */
export const LicensesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <LicensesTable />
    </Suspense>
  );
};
