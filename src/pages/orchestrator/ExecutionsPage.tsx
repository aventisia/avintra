import { lazy, Suspense } from 'react';

import { DataTableSkeleton } from '@/react-toolkit/ui/data-table/DataTableSkeleton';

// Lazy load the ExecutionsTable component.
const ExecutionsTable = lazy(() =>
  import(
    "@/features/orchestrator/executions-table/components/ExecutionsTable"
  ).then((module) => ({
    default: module.ExecutionsTable,
  })),
);

/**
 * Renders the executions table component.
 * @returns JSX element representing the execution or executions component.
 */
export const ExecutionsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ExecutionsTable />
    </Suspense>
  );
};
