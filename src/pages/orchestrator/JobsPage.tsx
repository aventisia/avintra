import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { lazy, Suspense } from "react";

// Lazy load the JobsTable component.
const JobsTable = lazy(() =>
  import("@/features/orchestrator/jobs-table/components/JobsTable").then(
    (module) => ({
      default: module.JobsTable,
    }),
  ),
);

/**
 * Renders the jobs table component.
 * @returns JSX element representing the execution or jobs component.
 */
export const JobsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <JobsTable />
    </Suspense>
  );
};
