import { lazy, Suspense } from 'react';

import { DataTableSkeleton } from '@/react-toolkit/ui/data-table/DataTableSkeleton';

// Lazy load the LicensesTable component.
const LicensesTable = lazy(() =>
  import("@/features/orchestrator/licenses-table/components/LicensesTable").then(
    (module) => ({
      default: module.LicensesTable,
    }),
  ),
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
