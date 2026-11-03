import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

// Lazy load the JobsTable component.
const JobsTable = lazy(() =>
  import("@/features/03-orchestrator/jobs-table/components/JobsTable").then((module) => ({
    default: module.JobsTable,
  })),
);

/**
 * Renders the jobs table component.
 * @returns JSX element representing the execution or jobs component.
 */
export const JobsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <JobsTable />
    </Suspense>
  );
};
