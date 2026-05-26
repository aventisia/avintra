import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the ExecutionLogs component.
const ExecutionLogs = lazy(() =>
  import(
    "@/features/03-orchestrator/jobs-table/components/execution-logs"
  ).then((module) => ({
    default: module.default,
  })),
);

/**
 * Renders the jobs execution logs component.
 * @returns JSX element representing the execution or jobs component.
 */
export const ExecutionLogsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ExecutionLogs />
    </Suspense>
  );
};
