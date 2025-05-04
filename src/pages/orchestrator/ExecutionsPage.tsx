import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

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
